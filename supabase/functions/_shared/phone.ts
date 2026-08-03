// Normalises Kenyan phone numbers to the 2547XXXXXXXX / 2541XXXXXXXX format.
export function normalizeKePhone(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("254")) {
    // ok
  } else if (n.startsWith("0")) {
    n = "254" + n.slice(1);
  } else if (n.length === 9) {
    n = "254" + n;
  } else {
    return null;
  }
  if (!/^254(7|1)\d{8}$/.test(n)) return null;
  return n;
}

export function toE164(input: string): string | null {
  const n = normalizeKePhone(input);
  return n ? `+${n}` : null;
}
