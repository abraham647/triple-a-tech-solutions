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
  name: "submit_product_inquiry",
  title: "Submit product inquiry",
  description:
    "Submit a product inquiry / quote request to Triple A Tech Solutions. Optionally reference a product by id.",
  inputSchema: {
    customer_name: z.string().describe("Full name of the person inquiring."),
    customer_email: z.string().describe("Contact email address."),
    customer_phone: z.string().describe("Contact phone number."),
    message: z.string().describe("What the customer is interested in."),
    product_id: z.string().optional().describe("Optional product id from list_products."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ customer_name, customer_email, customer_phone, message, product_id }) => {
    const name = customer_name.trim();
    const email = customer_email.trim();
    const phone = customer_phone.trim();
    if (!name || !email || !phone || !message.trim()) {
      return { content: [{ type: "text", text: "Name, email, phone and message are required." }], isError: true };
    }
    const supabase = publicSupabase();
    const { data, error } = await supabase
      .from("product_inquiries")
      .insert({
        product_id: product_id ?? null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        message: message.trim(),
      })
      .select("id");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Inquiry submitted. The team will get back to you shortly." }],
      structuredContent: { id: data?.[0]?.id },
    };
  },
});
