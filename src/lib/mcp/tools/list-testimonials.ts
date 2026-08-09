import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_testimonials",
  title: "List testimonials",
  description: "List approved customer testimonials for Triple A Tech Solutions.",
  inputSchema: {
    limit: z.number().int().optional().describe("Max testimonials to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
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
