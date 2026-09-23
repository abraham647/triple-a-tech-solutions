import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { normalizeKePhone } from "../_shared/phone.ts";
import { sendAdminSms } from "../_shared/notify.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const BodySchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string().max(255).optional().default(""),
  customer_name: z.string().trim().min(1).max(120),
  customer_phone: z.string().trim().min(7).max(20),
  customer_email: z.string().trim().max(255).optional().default(""),
  delivery_notes: z.string().trim().max(1000).optional().default(""),
  quantity: z.number().int().min(1).max(100),
  amount: z.number().min(1).max(1000000),
  // "cash_on_delivery" = 50% deposit charged now, balance on delivery
  payment_method: z.enum(["mpesa", "cash_on_delivery"]).optional().default("mpesa"),
  charge_amount: z.number().min(1).max(1000000).optional(),
});

function darajaBase() {
  return Deno.env.get("MPESA_ENV") === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function timestamp() {
  // Daraja expects EAT (UTC+3) timestamps
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

Deno.serve(async (req) => {
  // Always JSON, always CORS — never let the browser mask the message.
  const json = (payload: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Use POST" });

  try {
    const raw = await req.json().catch(() => null);
    if (!raw) return json({ ok: false, error: "Invalid request body" });

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      const first = Object.entries(fields).map(([k, v]) => `${k}: ${v?.[0]}`).join(", ");
      return json({ ok: false, error: first || "Invalid details", fields });
    }
    const b = parsed.data;

    // Accepts +254…, 254…, 07…, 01…, 7…, 1…
    const msisdn = normalizeKePhone(b.customer_phone);
    if (!msisdn) {
      return json({ ok: false, error: "Enter a valid Safaricom number, e.g. 0712345678" });
    }

    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");

    const missing = [
      ["MPESA_CONSUMER_KEY", consumerKey],
      ["MPESA_CONSUMER_SECRET", consumerSecret],
      ["MPESA_SHORTCODE", shortcode],
      ["MPESA_PASSKEY", passkey],
    ].filter(([, v]) => !v).map(([k]) => k as string);

    if (missing.length) {
      console.error("Missing M-Pesa configuration:", missing.join(", "));
      return json({
        ok: false,
        error: `M-Pesa is not configured yet (missing: ${missing.join(", ")}). Please contact us to complete your order.`,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const total = Math.round(b.amount * b.quantity);
    const isDeposit = b.payment_method === "cash_on_delivery";
    const charge = isDeposit
      ? Math.max(1, Math.ceil(total / 2))
      : Math.round(b.charge_amount ?? total);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_id: b.product_id ?? null,
        product_name: b.product_name ?? "",
        customer_name: b.customer_name.trim(),
        customer_phone: `+${msisdn}`,
        customer_email: b.customer_email ?? "",
        delivery_notes: b.delivery_notes ?? "",
        quantity: b.quantity,
        amount: total,
        payment_method: b.payment_method,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr);
      return json({ ok: false, error: `Could not create your order: ${orderErr?.message ?? "unknown error"}` });
    }

    // 1. OAuth token
    const tokenRes = await fetch(`${darajaBase()}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}` },
    });
    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      console.error(`Daraja auth failed [${tokenRes.status}]: ${tokenText}`);
      await supabase.from("orders").update({ status: "failed", result_desc: "Auth failed" }).eq("id", order.id);
      return json({ ok: false, error: `M-Pesa authentication failed (${tokenRes.status}): ${tokenText.slice(0, 200)}` });
    }
    const access_token = JSON.parse(tokenText)?.access_token;
    if (!access_token) {
      return json({ ok: false, error: "M-Pesa did not return an access token. Check your consumer key and secret." });
    }

    // 2. STK push
    const ts = timestamp();
    const password = btoa(`${shortcode}${passkey}${ts}`);
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`;

    const pushRes = await fetch(`${darajaBase()}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: charge,
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: callbackUrl,
        AccountReference: `TRIPLEA-${order.id.slice(0, 8)}`,
        TransactionDesc: (isDeposit ? `Deposit ${b.product_name || "Order"}` : b.product_name || "Order").slice(0, 60),
      }),
    });

    const pushText = await pushRes.text();
    let pushBody: any = {};
    try { pushBody = JSON.parse(pushText); } catch { /* keep raw */ }

    if (!pushRes.ok || pushBody?.ResponseCode !== "0") {
      console.error(`STK push failed [${pushRes.status}]: ${pushText}`);
      const reason =
        pushBody?.errorMessage ??
        pushBody?.ResponseDescription ??
        pushText.slice(0, 200) ??
        "STK push failed";
      await supabase.from("orders").update({ status: "failed", result_desc: String(reason) }).eq("id", order.id);
      return json({ ok: false, error: `M-Pesa: ${reason}`, daraja_status: pushRes.status });
    }

    await supabase
      .from("orders")
      .update({
        merchant_request_id: pushBody.MerchantRequestID,
        checkout_request_id: pushBody.CheckoutRequestID,
      })
      .eq("id", order.id);

    sendAdminSms(
      isDeposit
        ? `NEW ORDER - PAY ON DELIVERY (awaiting 50% deposit)\n${b.product_name || "Product"} x${b.quantity}\nTotal KES ${total} - deposit KES ${charge}\n${b.customer_name.trim()} - +${msisdn}`
        : `NEW ORDER (awaiting payment)\n${b.product_name || "Product"} x${b.quantity}\nKES ${total}\n${b.customer_name.trim()} - +${msisdn}`,
    ).catch(() => {});

    return json({
      ok: true,
      order_id: order.id,
      checkout_request_id: pushBody.CheckoutRequestID,
      message: "Payment prompt sent to your phone.",
    });
  } catch (e) {
    console.error("mpesa-stkpush error:", e);
    return json({ ok: false, error: `Unexpected error: ${e instanceof Error ? e.message : String(e)}` });
  }
});
