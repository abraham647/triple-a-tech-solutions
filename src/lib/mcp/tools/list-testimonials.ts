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
  name: "list_testimonials",
  title: "List testimonials",
  description: "List approved customer testimonials for Triple A Tech Solutions.",
  inputSchema: {
    limit: z.number().int().optional().describe("Max testimonials to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = publicSupabase();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, role, content, rating, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit ?? 20, 100));
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { testimonials: data ?? [] },
    };
  },
});
