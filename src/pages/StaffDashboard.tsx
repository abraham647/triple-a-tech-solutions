import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield, ShoppingBag, Users, MessageSquare, BarChart3, Package, User } from "lucide-react";

type UserRole = "manager" | "sales_agent" | "technician";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!roles || roles.length === 0) { navigate("/"); return; }
      
      // Check for staff roles (not admin)
      const staffRole = roles.find((r: any) => ["manager", "sales_agent", "technician"].includes(r.role));
      const isAdmin = roles.some((r: any) => r.role === "admin");
      
      if (isAdmin) { navigate("/admin"); return; }
      if (!staffRole) { navigate("/"); return; }
      
      setRole(staffRole.role as UserRole);
      setLoading(false);
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (!role) return;
    fetchData();
  }, [role]);

  const fetchData = async () => {
    if (role === "manager" || role === "sales_agent") {
      const { data: p } = await supabase.from("products").select("*").order("display_order");
      if (p) setProducts(p);
      const { data: i } = await supabase.from("product_inquiries").select("*").order("created_at", { ascending: false });
      if (i) setInquiries(i);
    }
    if (role === "manager" || role === "technician") {
      const { data: e } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (e) setEmployees(e);
    }
    if (role === "manager") {
      const { data: m } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (m) setMessages(m);
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-primary font-display">Loading dashboard...</div></div>;
  }

  const roleLabels: Record<UserRole, string> = { manager: "Manager", sales_agent: "Sales Agent", technician: "Technician" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">{roleLabels[role!]} Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>View Site</Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-1" /> Sign Out</Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 flex-1">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(role === "manager" || role === "sales_agent") && (
            <>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{inquiries.filter(i => i.status === "new").length}</p>
                    <p className="text-xs text-muted-foreground">New Inquiries</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {(role === "manager" || role === "technician") && (
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{employees.filter(e => e.is_active).length}</p>
                  <p className="text-xs text-muted-foreground">Active Employees</p>
                </div>
              </div>
            </div>
          )}
          {role === "manager" && (
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{messages.filter(m => !m.is_read).length}</p>
                  <p className="text-xs text-muted-foreground">Unread Messages</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        {(role === "manager" || role === "sales_agent") && (
          <div className="mb-8">
            <h2 className="font-display font-bold text-lg mb-4">Recent Product Inquiries</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inquiries.slice(0, 20).map(inq => (
                <div key={inq.id} className={`p-4 rounded-xl border ${inq.status === "new" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{inq.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{inq.customer_email} · {inq.customer_phone}</p>
                      <p className="text-sm text-muted-foreground mt-1">{inq.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(inq.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inq.status === "new" ? "bg-primary/20 text-primary" : inq.status === "contacted" ? "bg-yellow-500/20 text-yellow-600" : "bg-muted text-muted-foreground"}`}>
                      {inq.status}
                    </span>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No inquiries yet.</p>}
            </div>
          </div>
        )}

        {/* Employees List */}
        {(role === "manager" || role === "technician") && (
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Employees ({employees.filter(e => e.is_active).length} active)</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employees.filter(e => e.is_active).map(emp => (
                <div key={emp.id} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                  {emp.photo_url ? (
                    <img src={emp.photo_url} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
