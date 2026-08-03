// Sends an SMS alert to the admin via the Twilio connector gateway.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export async function sendAdminSms(body: string): Promise<{ ok: boolean; details?: string }> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const twilioKey = Deno.env.get("TWILIO_API_KEY");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");
  const to = Deno.env.get("ADMIN_ALERT_PHONE");

  if (!lovableKey || !twilioKey || !from || !to) {
    console.error("SMS not configured", {
      lovableKey: !!lovableKey,
      twilioKey: !!twilioKey,
      from: !!from,
      to: !!to,
    });
    return { ok: false, details: "SMS not configured" };
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body.slice(0, 1500) }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Twilio SMS failed [${res.status}]: ${errorBody}`);
      return { ok: false, details: `[${res.status}] ${errorBody}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Twilio SMS threw:", e);
    return { ok: false, details: String(e) };
  }
}
