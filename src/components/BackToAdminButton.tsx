import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Floating shortcut shown only to signed-in admins while they browse the public site.
const HIDDEN_PREFIXES = ["/admin", "/employee", "/auth", "/reset-password", "/.lovable"];

const BackToAdminButton = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const check = async (userId?: string) => {
      if (!userId) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => check(session?.user?.id));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user?.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const hidden = HIDDEN_PREFIXES.some(p => location.pathname.startsWith(p));
  if (!isAdmin || hidden) return null;

  return (
    <button
      onClick={() => navigate("/admin")}
      className="fixed bottom-24 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      aria-label="Back to admin dashboard"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Admin
    </button>
  );
};

export default BackToAdminButton;
