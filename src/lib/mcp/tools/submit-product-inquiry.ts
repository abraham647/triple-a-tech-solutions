import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "submit_product_inquiry",
  title: "Submit product inquiry",
  description:
    "Submit a product inquiry / quote request to Triple A Tech Solutions. Optionally reference a product by id.",
  inputSchema: {
    customer_name: z.string().trim().min(1).max(120).describe("Full name of the person inquiring."),
    customer_email: z.string().trim().email().max(200).describe("Contact email address."),
    customer_phone: z.string().trim().min(7).max(30).describe("Contact phone number."),
    message: z.string().trim().min(1).max(2000).describe("What the customer is interested in."),
    product_id: z.string().uuid().optional().describe("Optional product id from list_products."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ customer_name, customer_email, customer_phone, message, product_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("product_inquiries")
      .insert({
        product_id: product_id ?? null,
        customer_name,
        customer_email,
        customer_phone,
        message,
      })
      .select("id");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Inquiry submitted. The team will get back to you shortly." }],
      structuredContent: { id: data?.[0]?.id },
    };
  },
});
