import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function publicSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List active security products from Triple A Tech Solutions, optionally filtered by category or search term.",
  inputSchema: {
    category: z.string().optional().describe("Filter by product category."),
    search: z.string().optional().describe("Search term matched against product name."),
    limit: z.number().int().optional().describe("Max products to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, search, limit }) => {
    const supabase = publicSupabase();
    let query = supabase
      .from("products")
      .select("id, name, description, category, price, stock_status, image_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(Math.min(limit ?? 20, 100));
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
