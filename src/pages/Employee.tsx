import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, LogOut, User, Phone, Mail, FileText, Save, KeyRound,
  CheckCircle, AlertCircle, Award, Clock, LayoutDashboard, ShoppingCart,
  Package, Briefcase, MessageSquare,
} from "lucide-react";

const recordIcon: Record<string, React.ElementType> = {
  note: FileText, warning: AlertCircle, incident: AlertCircle,
  commendation: Award, disciplinary: AlertCircle,
};

const INQUIRY_STATUSES = ["new", "contacted", "quoted", "won", "lost"];

const Employee = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [tab, setTab] = useState<"dashboard" | "workspace" | "records" | "settings">("dashboard");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // profile editing
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pPhoto, setPPhoto] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // workspace data
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const isSales = roles.includes("sales_agent") || roles.includes("manager");
  const isManager = roles.includes("manager");
  const isTechnician = roles.includes("technician");
  const hasWorkspace = isSales || isTechnician;

  const loadEmployee = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const userRoles = (roleRows || []).map((r: any) => r.role);
    setRoles(userRoles);

    const { data: emp } = await supabase.from("employees").select("*").eq("user_id", user.id).maybeSingle();
    if (!emp) { navigate("/"); return; }
    if (!emp.is_active) {
      await supabase.auth.signOut();
      toast({ title: "Account deactivated", description: "Your account has been deactivated. Contact your administrator.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setEmployee(emp);
    setPName(emp.name || "");
    setPPhone(emp.phone || "");
    setPPhoto(emp.photo_url || "");

    const { data: recs } = await supabase.from("employee_records").select("*").eq("employee_id", emp.id).order("created_at", { ascending: false });
    if (recs) setRecords(recs);

    // workspace data based on department
    if (userRoles.includes("sales_agent") || userRoles.includes("manager")) {
      const { data: inq } = await supabase.from("product_inquiries").select("*").order("created_at", { ascending: false });
      if (inq) setInquiries(inq);
      const { data: prod } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (prod) setProducts(prod);
    }
    if (userRoles.includes("manager")) {
      const { data: msgs } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (msgs) setMessages(msgs);
    }
    setLoading(false);
  };

  useEffect(() => { loadEmployee(); }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  const updatePassword = async () => {
    if (!newPassword) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated!" });
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data, error } = await supabase.rpc("update_my_employee_profile", {
        p_name: pName, p_phone: pPhone, p_photo_url: pPhoto,
      });
      if (error) throw error;
      setEmployee(data);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSavingProfile(false); }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("product_inquiries").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    toast({ title: "Inquiry updated" });
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-primary font-display">Loading...</div></div>;
  }

  const tabs = [
    { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, show: true },
    { key: "workspace" as const, label: "Workspace", icon: Briefcase, show: hasWorkspace },
    { key: "records" as const, label: "My Records", icon: FileText, show: true },
    { key: "settings" as const, label: "Settings", icon: KeyRound, show: true },
  ].filter(t => t.show);

  const deptLabel = isManager ? "Manager" : isSales ? "Sales Agent" : isTechnician ? "Technician" : "Employee";

  const newInquiries = inquiries.filter(i => i.status === "new").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Employee Portal</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary ml-1">{deptLabel}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-1" /> Sign Out</Button>
        </div>
      </header>

      <div className="sticky top-14 z-40 bg-background border-b border-border">
        <div className="container px-4 py-2 flex gap-1.5 overflow-x-auto">
          {tabs.map(t => (
            <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)} className="shrink-0">
              <t.icon className="w-4 h-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="container px-4 py-6 flex-1 max-w-3xl">
        {tab === "dashboard" && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card flex items-center gap-4">
              {employee.photo_url ? (
                <img src={employee.photo_url} alt={employee.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-8 h-8 text-primary" /></div>
              )}
              <div>
                <h1 className="font-display font-bold text-xl">{employee.name}</h1>
                <p className="text-primary text-sm">{employee.role}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary inline-flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              </div>
            </div>

            {/* Department-specific quick stats */}
            {hasWorkspace && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {isSales && (
                  <>
                    <button onClick={() => setTab("workspace")} className="text-left p-4 rounded-xl border border-primary/40 bg-primary/5">
                      <ShoppingCart className="w-5 h-5 mb-2 text-primary" />
                      <p className="text-2xl font-bold font-display">{newInquiries}</p>
                      <p className="text-xs text-muted-foreground">New Inquiries</p>
                    </button>
                    <button onClick={() => setTab("workspace")} className="text-left p-4 rounded-xl border border-border bg-card">
                      <ShoppingCart className="w-5 h-5 mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold font-display">{inquiries.length}</p>
                      <p className="text-xs text-muted-foreground">Total Inquiries</p>
                    </button>
                    <button onClick={() => setTab("workspace")} className="text-left p-4 rounded-xl border border-border bg-card">
                      <Package className="w-5 h-5 mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold font-display">{products.length}</p>
                      <p className="text-xs text-muted-foreground">Products</p>
                    </button>
                  </>
                )}
                {isManager && (
                  <button onClick={() => setTab("workspace")} className="text-left p-4 rounded-xl border border-border bg-card">
                    <MessageSquare className="w-5 h-5 mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold font-display">{messages.length}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </button>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{employee.phone || "—"}</p></div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{employee.email || "—"}</p></div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">Hired</p><p className="text-sm font-medium">{new Date(employee.hired_at).toLocaleDateString()}</p></div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">Records</p><p className="text-sm font-medium">{records.length}</p></div>
              </div>
            </div>
          </div>
        )}

        {tab === "workspace" && hasWorkspace && (
          <div className="space-y-6">
            {isSales && (
              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Product Inquiries ({inquiries.length})</h2>
                <p className="text-sm text-muted-foreground">Handle customer inquiries — contact leads and move them through your pipeline.</p>
                {inquiries.map(i => (
                  <div key={i.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{i.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{i.customer_email}{i.customer_phone ? ` · ${i.customer_phone}` : ""}</p>
                        {i.product_name && <p className="text-xs text-primary mt-0.5">Re: {i.product_name}</p>}
                        {i.message && <p className="text-sm text-muted-foreground mt-1">{i.message}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(i.created_at).toLocaleString()}</p>
                      </div>
                      <select value={i.status} onChange={e => updateInquiryStatus(i.id, e.target.value)} className="h-9 rounded-xl border border-border bg-background px-2 text-sm shrink-0">
                        {INQUIRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && <p className="text-muted-foreground text-sm">No inquiries yet.</p>}
              </div>
            )}

            {isSales && (
              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Products ({products.length})</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {products.map(p => (
                    <div key={p.id} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{p.name}</p>
                        {p.price && <p className="text-xs text-primary">{p.price}</p>}
                        <p className="text-xs text-muted-foreground">{p.is_active ? "Active" : "Hidden"}</p>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-muted-foreground text-sm">No products yet.</p>}
                </div>
              </div>
            )}

            {isManager && (
              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Contact Messages ({messages.length})</h2>
                {messages.map(m => (
                  <div key={m.id} className="p-4 rounded-xl border border-border bg-card">
                    <p className="font-semibold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                    <p className="text-sm text-muted-foreground mt-1">{m.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-muted-foreground text-sm">No messages yet.</p>}
              </div>
            )}

            {isTechnician && (
              <div className="p-6 rounded-xl border border-border bg-card text-center">
                <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Your technician workspace is ready. Assignment tools will appear here as tasks are allocated by your manager.</p>
              </div>
            )}
          </div>
        )}

        {tab === "records" && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg">My Records ({records.length})</h2>
            {records.map(r => {
              const Icon = recordIcon[r.record_type] || FileText;
              return (
                <div key={r.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-sm">{r.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.record_type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString()}</p>
                </div>
              );
            })}
            {records.length === 0 && <p className="text-muted-foreground text-sm">No records yet.</p>}
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-md space-y-4">
            <h2 className="font-display font-bold text-lg">Account Settings</h2>

            {/* Profile editing — email is read-only */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> My Profile</h3>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={pName} onChange={e => setPName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={pPhone} onChange={e => setPPhone(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Photo URL</Label>
                <Input value={pPhoto} onChange={e => setPPhoto(e.target.value)} placeholder="https://..." className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Email (managed by admin)</Label>
                <Input value={employee.email || ""} disabled readOnly className="rounded-xl opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Your email can only be changed by an administrator.</p>
              </div>
              <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
                <Save className="w-4 h-4 mr-1" /> {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            {/* Password */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4 text-primary" /> Change Password</h3>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} className="rounded-xl" />
              </div>
              <Button onClick={updatePassword} disabled={saving || !newPassword} className="w-full">
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employee;
