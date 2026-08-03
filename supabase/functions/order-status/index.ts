import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Schema = z.object({ order_id: z.string().uuid() });

// Lets the buyer poll their own order's payment status without exposing the orders table.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid order id" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase
      .from("orders")
      .select("status, mpesa_receipt, amount, result_desc")
      .eq("id", parsed.data.order_id)
      .maybeSingle();

    if (error) {
      console.error("order-status query failed:", error);
      return json({ error: "Could not read order status" }, 500);
    }
    if (!data) return json({ error: "Order not found" }, 404);

    return json(data);
  } catch (e) {
    console.error("order-status error:", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
