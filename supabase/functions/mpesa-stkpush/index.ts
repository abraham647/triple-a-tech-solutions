import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { normalizeKePhone } from "../_shared/phone.ts";
import { sendAdminSms } from "../_shared/notify.ts";

const BodySchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string().max(255).optional().default(""),
  customer_name: z.string().trim().min(1).max(120),
  customer_phone: z.string().trim().min(7).max(20),
  customer_email: z.string().trim().max(255).optional().default(""),
  delivery_notes: z.string().trim().max(1000).optional().default(""),
  quantity: z.number().int().min(1).max(100),
  amount: z.number().min(1).max(1000000),
});

function darajaBase() {
  return Deno.env.get("MPESA_ENV") === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function timestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const b = parsed.data;

    const msisdn = normalizeKePhone(b.customer_phone);
    if (!msisdn) return json({ error: "Enter a valid Safaricom number, e.g. 0712345678" }, 400);

    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return json({ error: "M-Pesa is not configured yet. Please contact us to complete your order." }, 503);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const total = Math.round(b.amount * b.quantity);

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
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr);
      return json({ error: "Could not create your order. Please try again." }, 500);
    }

    // 1. OAuth token
    const tokenRes = await fetch(`${darajaBase()}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}` },
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error(`Daraja auth failed [${tokenRes.status}]: ${t}`);
      await supabase.from("orders").update({ status: "failed", result_desc: "Auth failed" }).eq("id", order.id);
      return json({ error: "Payment service unavailable. Please try again shortly." }, 502);
    }
    const { access_token } = await tokenRes.json();

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
        Amount: total,
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: callbackUrl,
        AccountReference: `TRIPLEA-${order.id.slice(0, 8)}`,
        TransactionDesc: (b.product_name || "Order").slice(0, 60),
      }),
    });

    const pushBody = await pushRes.json().catch(() => ({}));
    if (!pushRes.ok || pushBody?.ResponseCode !== "0") {
      console.error(`STK push failed [${pushRes.status}]:`, JSON.stringify(pushBody));
      await supabase
        .from("orders")
        .update({ status: "failed", result_desc: pushBody?.errorMessage ?? pushBody?.ResponseDescription ?? "STK push failed" })
        .eq("id", order.id);
      return json({ error: pushBody?.errorMessage ?? "Could not send the payment prompt. Check the number and try again." }, 400);
    }

    await supabase
      .from("orders")
      .update({
        merchant_request_id: pushBody.MerchantRequestID,
        checkout_request_id: pushBody.CheckoutRequestID,
      })
      .eq("id", order.id);

    // Alert the admin that an order attempt came in (fire and forget)
    sendAdminSms(
      `NEW ORDER (awaiting payment)\n${b.product_name || "Product"} x${b.quantity}\nKES ${total}\n${b.customer_name.trim()} - +${msisdn}`,
    ).catch(() => {});

    return json({ order_id: order.id, checkout_request_id: pushBody.CheckoutRequestID, message: "Payment prompt sent to your phone." });
  } catch (e) {
    console.error("mpesa-stkpush error:", e);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
