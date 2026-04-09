import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Check, X, Trash2, Users, MessageSquare, Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tab, setTab] = useState<"testimonials" | "users">("testimonials");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = roles?.some((r: any) => r.role === "admin");
      if (!admin) { navigate("/"); return; }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchTestimonials();
    fetchUsers();
  }, [isAdmin]);

  const fetchTestimonials = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (data) setTestimonials(data as Testimonial[]);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await supabase.from("testimonials").update({ approved: !current }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: !current } : t));
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-display">Verifying access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>View Site</Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "testimonials" ? "default" : "outline"} size="sm" onClick={() => setTab("testimonials")}>
            <MessageSquare className="w-4 h-4 mr-1" /> Testimonials ({testimonials.length})
          </Button>
          <Button variant={tab === "users" ? "default" : "outline"} size="sm" onClick={() => setTab("users")}>
            <Users className="w-4 h-4 mr-1" /> Users ({users.length})
          </Button>
        </div>

        {tab === "testimonials" && (
          <div className="space-y-4">
            {testimonials.length === 0 && <p className="text-muted-foreground text-sm">No testimonials yet.</p>}
            {testimonials.map(t => (
              <div key={t.id} className={`p-4 rounded-xl border ${t.approved ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{t.name}</p>
                      {t.role && <span className="text-xs text-muted-foreground">• {t.role}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.approved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {t.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 ml-4 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => toggleApproval(t.id, t.approved)} title={t.approved ? "Revoke" : "Approve"}>
                      {t.approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTestimonial(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.length === 0 && <p className="text-muted-foreground text-sm">No users yet.</p>}
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{u.display_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
