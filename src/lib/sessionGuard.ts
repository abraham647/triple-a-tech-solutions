import { supabase } from "@/integrations/supabase/client";

// Security rule: a login only lives for the current browser window/session.
// sessionStorage is cleared when the window/tab is closed, so on the next
// visit the marker is gone and we wipe any stored auth session, forcing a
// fresh login (admin included). Reloads within the same window keep the login.
const MARKER = "aa_window_session";

export function enforceWindowSession() {
  try {
    if (!sessionStorage.getItem(MARKER)) {
      sessionStorage.setItem(MARKER, "1");
      // Local sign-out only clears the stored tokens on this device.
      supabase.auth.signOut({ scope: "local" });
    }
  } catch {
    // sessionStorage unavailable (e.g. privacy mode) — do nothing.
  }
}

// Call before a full-page redirect (e.g. Google OAuth) so the returning
// page in the same tab is recognized as the same window session.
export function markWindowSession() {
  try {
    sessionStorage.setItem(MARKER, "1");
  } catch {
    // ignore
  }
}
