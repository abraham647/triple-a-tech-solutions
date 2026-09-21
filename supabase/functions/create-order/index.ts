import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendAdminSms } from "../_shared/notify.ts";

// Creates an order for payment methods that are settled manually
// (bank transfer, pay on delivery). No card/PIN data is ever accepted here.
const BodySchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  product_name: z.string().max(255).optional().default(""),
  customer_name: z.string().trim().min(1).max(120),
  customer_phone: z.string().trim().min(7).max(20),
  customer_email: z.string().trim().max(255).optional().default(""),
  delivery_notes: z.string().trim().max(1000).optional().default(""),
  quantity: z.number().int().min(1).max(100),
  amount: z.number().min(1).max(1000000),
  payment_method: z.enum(["bank_transfer", "cash_on_delivery"]),
});

const LABEL: Record<string, string> = {
  bank_transfer: "BANK TRANSFER",
  cash_on_delivery: "PAY ON DELIVERY",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const total = Math.round(b.amount * b.quantity);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        product_id: b.product_id ?? null,
        product_name: b.product_name ?? "",
        customer_name: b.customer_name.trim(),
        customer_phone: b.customer_phone.trim(),
        customer_email: b.customer_email ?? "",
        delivery_notes: b.delivery_notes ?? "",
        quantity: b.quantity,
        amount: total,
        payment_method: b.payment_method,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !order) {
      console.error("Order insert failed:", error);
      return json({ error: "Could not create your order. Please try again." }, 500);
    }

    sendAdminSms(
      `NEW ORDER - ${LABEL[b.payment_method]}\n${b.product_name || "Product"} x${b.quantity}\nKES ${total}\n${b.customer_name.trim()} - ${b.customer_phone.trim()}`,
    ).catch(() => {});

    return json({ order_id: order.id, reference: `TRIPLEA-${order.id.slice(0, 8).toUpperCase()}`, total });
  } catch (e) {
    console.error("create-order error:", e);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
