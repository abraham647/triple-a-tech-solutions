import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendAdminSms } from "../_shared/notify.ts";

const Schema = z.object({
  type: z.enum(["quote", "inquiry", "contact"]),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).optional().default(""),
  subject: z.string().trim().max(160).optional().default(""),
});

const LABEL: Record<string, string> = {
  quote: "NEW QUOTE REQUEST",
  inquiry: "NEW PRODUCT INQUIRY",
  contact: "NEW CONTACT MESSAGE",
};

// Public endpoint: sends the admin a short SMS alert when a client submits a form.
// Only non-sensitive summary fields are accepted so nothing private travels via SMS.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { type, name, phone, subject } = parsed.data;

    const lines = [LABEL[type], name, phone, subject].filter(Boolean);
    const result = await sendAdminSms(`${lines.join("\n")}\nCheck the admin dashboard.`);

    if (!result.ok) return json({ sent: false, details: result.details }, 200);
    return json({ sent: true });
  } catch (e) {
    console.error("notify-admin error:", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
