import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

// POS <-> website link. The POS app authenticates with the shared POS_SYNC_KEY
// sent in the "x-pos-key" header.
//   GET  ?updated_since=ISO  -> active products with price, barcode and stock
//   POST { sale_id, items[], payment_method, customer_*, mpesa_receipt } -> records sale, decrements stock
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (p: unknown, status = 200) =>
  new Response(JSON.stringify(p), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SaleSchema = z.object({
  sale_id: z.string().min(1).max(100),
  items: z.array(z.object({
    product_id: z.string().uuid().nullable().optional(),
    name: z.string().max(255),
    quantity: z.number().int().min(1).max(10000),
    unit_price: z.number().min(0).max(10000000),
  })).min(1).max(200),
  payment_method: z.string().max(40).default("cash"),
  customer_name: z.string().trim().max(120).optional().default("Walk-in customer"),
  customer_phone: z.string().trim().max(20).optional().default("POS"),
  mpesa_receipt: z.string().max(40).optional(),
  status: z.enum(["paid", "pending", "failed"]).default("paid"),
});

const ProductsSchema = z.object({
  action: z.literal("upsert_products"),
  products: z.array(z.object({
    id: z.string().uuid().optional(),
    barcode: z.string().trim().max(64).optional(),
    name: z.string().trim().min(1).max(255),
    description: z.string().max(5000).optional(),
    category: z.string().max(80).optional(),
    price: z.number().min(0).max(100000000),
    image_url: z.string().url().max(2000).nullable().optional(),
    images: z.array(z.string().url().max(2000)).max(20).optional(),
    stock_quantity: z.number().int().min(0).max(10000000).nullable().optional(),
    is_active: z.boolean().optional(),
  })).min(1).max(500),
});

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = Deno.env.get("POS_SYNC_KEY");
    if (!key) return json({ ok: false, error: "POS link not configured (POS_SYNC_KEY missing)" }, 500);
    if (!safeEqual(req.headers.get("x-pos-key") ?? "", key)) return json({ ok: false, error: "Unauthorized" }, 401);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    if (req.method === "GET") {
      const since = new URL(req.url).searchParams.get("updated_since");
      let q = db.from("products")
        .select("id, name, description, category, price, image_url, images, barcode, stock_quantity, stock_status, is_active, updated_at")
        .not("barcode", "is", null)
        .neq("barcode", "")
        .order("name");
      if (since) q = q.gte("updated_at", since);
      else q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, products: data, synced_at: new Date().toISOString() });
    }

    if (req.method !== "POST") return json({ ok: false, error: "Use GET or POST" }, 405);

    const body = await req.json().catch(() => null);

    // Products created/edited in the POS -> Admin -> website.
    if (body?.action === "upsert_products") {
      const p = ProductsSchema.safeParse(body);
      if (!p.success) return json({ ok: false, error: "Invalid products", fields: p.error.flatten().fieldErrors }, 400);
      const results: { pos_ref: string; id?: string; error?: string }[] = [];
      for (const it of p.data.products) {
        const row: Record<string, unknown> = { name: it.name, price: it.price };
        if (it.description !== undefined) row.description = it.description;
        if (it.category !== undefined) row.category = it.category;
        if (it.image_url !== undefined) row.image_url = it.image_url;
        if (it.images !== undefined) row.images = it.images;
        if (it.is_active !== undefined) row.is_active = it.is_active;
        if (it.barcode !== undefined) row.barcode = it.barcode || null;
        if (it.stock_quantity !== undefined) {
          row.stock_quantity = it.stock_quantity;
          if (it.stock_quantity !== null) {
            row.stock_status = it.stock_quantity === 0 ? "out_of_stock" : it.stock_quantity <= 5 ? "low_stock" : "in_stock";
          }
        }
        let existingId = it.id ?? null;
        if (!existingId && it.barcode) {
          const { data } = await db.from("products").select("id").eq("barcode", it.barcode).maybeSingle();
          existingId = data?.id ?? null;
        }
        const res = existingId
          ? await db.from("products").update(row).eq("id", existingId).select("id").single()
          : await db.from("products").insert(row).select("id").single();
        results.push({ pos_ref: it.id ?? it.barcode ?? it.name, id: res.data?.id, error: res.error?.message });
      }
      return json({ ok: results.every((r) => !r.error), results });
    }

    const parsed = SaleSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Invalid sale", fields: parsed.error.flatten().fieldErrors }, 400);
    const s = parsed.data;

    // Idempotent: the same POS sale is only recorded once.
    const { data: existing } = await db.from("orders").select("id").eq("pos_sale_id", s.sale_id).limit(1);
    if (existing?.length) return json({ ok: true, duplicate: true, order_ids: existing.map((o) => o.id) });

    const rows = s.items.map((it, i) => ({
      product_id: it.product_id ?? null,
      product_name: it.name,
      quantity: it.quantity,
      amount: Math.round(it.unit_price * it.quantity),
      customer_name: s.customer_name || "Walk-in customer",
      customer_phone: s.customer_phone || "POS",
      payment_method: s.payment_method,
      mpesa_receipt: s.mpesa_receipt ?? null,
      status: s.status,
      source: "pos",
      pos_sale_id: i === 0 ? s.sale_id : `${s.sale_id}#${i}`,
    }));
    const { data: inserted, error } = await db.from("orders").insert(rows).select("id");
    if (error) return json({ ok: false, error: error.message }, 500);

    if (s.status === "paid") {
      for (const it of s.items) {
        if (!it.product_id) continue;
        const { data: p } = await db.from("products").select("stock_quantity").eq("id", it.product_id).single();
        if (p?.stock_quantity == null) continue;
        const left = Math.max(0, p.stock_quantity - it.quantity);
        await db.from("products").update({
          stock_quantity: left,
          stock_status: left === 0 ? "out_of_stock" : left <= 5 ? "low_stock" : "in_stock",
        }).eq("id", it.product_id);
      }
    }
    return json({ ok: true, order_ids: inserted?.map((o) => o.id) ?? [] });
  } catch (e) {
    console.error("pos-sync error:", e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
