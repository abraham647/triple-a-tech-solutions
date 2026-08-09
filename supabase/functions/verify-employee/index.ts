import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UUID_RE = /^[0-9a-fA-F-]{8,64}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const qrCode = typeof body?.qr_code === "string" ? body.qr_code.trim() : "";

    if (!qrCode || qrCode.length > 64 || !UUID_RE.test(qrCode)) {
      return json({ error: "Invalid QR code" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .rpc("verify_employee_qr", { _qr_code: qrCode })
      .maybeSingle();

    if (error) {
      console.error("verify-employee rpc error", error);
      return json({ error: "Verification failed" }, 500);
    }
    if (!data) return json({ employee: null }, 200);

    return json({ employee: data }, 200);
  } catch (e) {
    console.error("verify-employee error", e);
    return json({ error: "Verification failed" }, 500);
  }
});
