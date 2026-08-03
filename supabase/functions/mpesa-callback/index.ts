import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendAdminSms } from "../_shared/notify.ts";

// Public webhook called by Safaricom Daraja after the customer responds to the STK prompt.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ack = () =>
    new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const payload = await req.json();
    console.log("mpesa-callback payload:", JSON.stringify(payload));

    const stk = payload?.Body?.stkCallback;
    if (!stk?.CheckoutRequestID) return ack();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const items: Array<{ Name: string; Value?: string | number }> =
      stk?.CallbackMetadata?.Item ?? [];
    const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
    const paid = String(stk.ResultCode) === "0";

    const { data: order } = await supabase
      .from("orders")
      .update({
        status: paid ? "paid" : "failed",
        mpesa_receipt: receipt ? String(receipt) : null,
        result_desc: stk.ResultDesc ?? null,
      })
      .eq("checkout_request_id", stk.CheckoutRequestID)
      .select("id, product_name, quantity, amount, customer_name, customer_phone")
      .maybeSingle();

    if (order && paid) {
      await sendAdminSms(
        `PAYMENT RECEIVED\n${order.product_name || "Product"} x${order.quantity}\nKES ${order.amount}\n${order.customer_name} - ${order.customer_phone}\nRef: ${receipt ?? "-"}`,
      );
    }

    return ack();
  } catch (e) {
    console.error("mpesa-callback error:", e);
    return ack();
  }
});
