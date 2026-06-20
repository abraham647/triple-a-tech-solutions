import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, LogOut, Check, X, Trash2, Users, MessageSquare, Star,
  Plus, Edit, Save, Mail, MailOpen, Briefcase, UserPlus, Printer,
  Eye, EyeOff, Settings, Image, Video, Link, ChevronDown, ChevronUp,
  Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, Bug, FlaskConical,
  Clock, Award, Headphones, Phone, CheckCircle, AlertCircle, PauseCircle,
  PlayCircle, FileText, User
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Icon map for dynamic icon selection
const iconMap: Record<string, React.ElementType> = {
  Shield, Camera, Bell, KeyRound, ShieldCheck, Monitor, Globe, Network, Lock,
  Cpu, ShieldAlert, Search, Siren, KeySquare, Skull, Bug, FlaskConical,
  Clock, Users, Award, Headphones, Star, CheckCircle, Phone, Mail: Mail,
  Briefcase, Eye, Image, Video, Link, AlertCircle, Settings, Plus, Edit, Save
};

const iconNames = Object.keys(iconMap);

type TabType = "services" | "whyus" | "portfolio" | "testimonials" | "messages" | "employees" | "users" | "profile" | "team" | "products" | "inquiries";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabType>("services");
  const [empFilter, setEmpFilter] = useState<"all" | "active" | "released" | "suspended">("all");

  // Data states
  const [services, setServices] = useState<any[]>([]);
  const [whyUsCards, setWhyUsCards] = useState<any[]>([]);
  const [portfolioWorks, setPortfolioWorks] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [empRecords, setEmpRecords] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Edit states
  const [editItem, setEditItem] = useState<any>(null);
  const [editDialog, setEditDialog] = useState<TabType | null>(null);
  const [recordDialog, setRecordDialog] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState({ record_type: "note", title: "", description: "" });

  // Profile states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = roles?.some((r: any) => r.role === "admin");
      if (!admin) { navigate("/"); return; }
      setIsAdmin(true);
      setAdminUser(user);
      setNewEmail(user.email || "");
      // Fetch admin profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (profile) setAdminProfile(profile);
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = () => {
    fetchServices(); fetchWhyUs(); fetchPortfolio();
    fetchTestimonials(); fetchMessages(); fetchEmployees(); fetchUsers(); fetchTeam();
    fetchProducts(); fetchInquiries();
  };

  const fetchServices = async () => { const { data } = await supabase.from("services").select("*").order("display_order"); if (data) setServices(data); };
  const fetchWhyUs = async () => { const { data } = await supabase.from("why_us_cards").select("*").order("display_order"); if (data) setWhyUsCards(data); };
  const fetchPortfolio = async () => { const { data } = await supabase.from("portfolio_works").select("*").order("display_order"); if (data) setPortfolioWorks(data); };
  const fetchTestimonials = async () => { const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false }); if (data) setTestimonials(data); };
  const fetchMessages = async () => { const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); if (data) setMessages(data); };
  const fetchEmployees = async () => { const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false }); if (data) setEmployees(data); };
  const fetchUsers = async () => { const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }); if (data) setUsers(data); };
  const fetchTeam = async () => { const { data } = await supabase.from("team_members").select("*").order("display_order"); if (data) setTeamMembers(data); };
  const fetchProducts = async () => { const { data } = await supabase.from("products").select("*").order("display_order"); if (data) setProducts(data); };
  const fetchInquiries = async () => { const { data } = await supabase.from("product_inquiries").select("*").order("created_at", { ascending: false }); if (data) setInquiries(data); };

  const fetchRecords = async (empId: string) => {
    const { data } = await supabase.from("employee_records").select("*").eq("employee_id", empId).order("created_at", { ascending: false });
    if (data) setEmpRecords(data);
  };

  // CRUD helpers
  const saveService = async (item: any) => {
    if (item.id) {
      const { error } = await supabase.from("services").update({ icon: item.icon, title: item.title, description: item.description, category: item.category, display_order: item.display_order }).eq("id", item.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("services").insert({ icon: item.icon, title: item.title, description: item.description, category: item.category, display_order: item.display_order || 0 });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Saved!" }); setEditDialog(null); fetchServices();
  };

  const deleteService = async (id: string) => { await supabase.from("services").delete().eq("id", id); fetchServices(); };

  const saveWhyUs = async (item: any) => {
    if (item.id) { await supabase.from("why_us_cards").update({ icon: item.icon, title: item.title, description: item.description, display_order: item.display_order }).eq("id", item.id); }
    else { await supabase.from("why_us_cards").insert({ icon: item.icon, title: item.title, description: item.description, display_order: item.display_order || 0 }); }
    toast({ title: "Saved!" }); setEditDialog(null); fetchWhyUs();
  };

  const deleteWhyUs = async (id: string) => { await supabase.from("why_us_cards").delete().eq("id", id); fetchWhyUs(); };

  const savePortfolio = async (item: any) => {
    if (item.id) { await supabase.from("portfolio_works").update({ title: item.title, description: item.description, image_url: item.image_url, video_url: item.video_url, external_url: item.external_url, display_order: item.display_order }).eq("id", item.id); }
    else { await supabase.from("portfolio_works").insert({ title: item.title, description: item.description, image_url: item.image_url, video_url: item.video_url, external_url: item.external_url, display_order: item.display_order || 0 }); }
    toast({ title: "Saved!" }); setEditDialog(null); fetchPortfolio();
  };

  const deletePortfolio = async (id: string) => { await supabase.from("portfolio_works").delete().eq("id", id); fetchPortfolio(); };

  const toggleApproval = async (id: string, current: boolean) => { await supabase.from("testimonials").update({ approved: !current }).eq("id", id); setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: !current } : t)); };
  const deleteTestimonial = async (id: string) => { await supabase.from("testimonials").delete().eq("id", id); setTestimonials(prev => prev.filter(t => t.id !== id)); };

  const toggleRead = async (id: string, current: boolean) => { await supabase.from("contact_messages").update({ is_read: !current }).eq("id", id); setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !current } : m)); };
  const deleteMessage = async (id: string) => { await supabase.from("contact_messages").delete().eq("id", id); setMessages(prev => prev.filter(m => m.id !== id)); };

  const saveEmployee = async (item: any) => {
    if (item.id) {
      await supabase.from("employees").update({
        name: item.name, role: item.role, phone: item.phone, email: item.email,
        photo_url: item.photo_url, is_active: item.is_active,
        released_at: item.is_active ? null : new Date().toISOString(),
        suspended_at: null
      }).eq("id", item.id);
    } else {
      await supabase.from("employees").insert({ name: item.name, role: item.role, phone: item.phone, email: item.email, photo_url: item.photo_url });
    }
    toast({ title: "Saved!" }); setEditDialog(null); fetchEmployees();
  };

  const releaseEmployee = async (id: string) => {
    await supabase.from("employees").update({ is_active: false, released_at: new Date().toISOString(), suspended_at: null }).eq("id", id);
    fetchEmployees();
  };

  const suspendEmployee = async (id: string) => {
    await supabase.from("employees").update({ is_active: false, suspended_at: new Date().toISOString() }).eq("id", id);
    fetchEmployees();
  };

  const reinstateEmployee = async (id: string) => {
    await supabase.from("employees").update({ is_active: true, suspended_at: null, released_at: null }).eq("id", id);
    fetchEmployees();
  };

  const addRecord = async (empId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("employee_records").insert({
      employee_id: empId, record_type: newRecord.record_type,
      title: newRecord.title, description: newRecord.description,
      recorded_by: user?.id
    });
    toast({ title: "Record added!" });
    setNewRecord({ record_type: "note", title: "", description: "" });
    fetchRecords(empId);
  };

  const deleteRecord = async (recId: string, empId: string) => {
    await supabase.from("employee_records").delete().eq("id", recId);
    fetchRecords(empId);
  };

  const saveTeamMember = async (item: any) => {
    if (item.id) {
      await supabase.from("team_members").update({ name: item.name, role: item.role, bio: item.bio, photo_url: item.photo_url, display_order: item.display_order, is_visible: item.is_visible }).eq("id", item.id);
    } else {
      await supabase.from("team_members").insert({ name: item.name, role: item.role, bio: item.bio, photo_url: item.photo_url, display_order: item.display_order || 0 });
    }
    toast({ title: "Saved!" }); setEditDialog(null); fetchTeam();
  };

  const deleteTeamMember = async (id: string) => { await supabase.from("team_members").delete().eq("id", id); fetchTeam(); };

  const handleImageUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
    return publicUrl;
  };

  const updateProfile = async () => {
    setProfileLoading(true);
    try {
      if (newPassword) { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; }
      if (newEmail) { const { error } = await supabase.auth.updateUser({ email: newEmail }); if (error) throw error; }
      toast({ title: "Profile updated!" }); setNewPassword("");
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setProfileLoading(false); }
  };

  const handleAvatarUpload = async (file: File) => {
    const url = await handleImageUpload(file);
    if (!url || !adminUser) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", adminUser.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setAdminProfile((prev: any) => ({ ...prev, avatar_url: url }));
    toast({ title: "Profile picture updated!" });
  };

  const printEmployeeCard = (emp: any) => {
    const verifyUrl = `${window.location.origin}/verify/${emp.qr_code}`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Employee ID - ${emp.name}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0}.card{width:340px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;overflow:hidden;color:#fff;box-shadow:0 20px 40px rgba(0,0,0,.3)}.header{background:linear-gradient(135deg,#3b82f6,#2563eb);padding:16px;text-align:center}.header h2{font-size:18px;font-weight:700}.header p{font-size:10px;opacity:.8;margin-top:2px}.body{padding:24px;text-align:center}.photo{width:80px;height:80px;border-radius:50%;border:3px solid #3b82f6;margin:0 auto 12px;background:#334155;display:flex;align-items:center;justify-content:center;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover}.name{font-size:20px;font-weight:700}.role{color:#3b82f6;font-size:14px;margin:4px 0 16px}.details{font-size:12px;color:#94a3b8;line-height:1.8}.qr{margin:16px auto 0;background:#fff;padding:8px;border-radius:8px;display:inline-block}.footer{text-align:center;padding:12px;font-size:9px;color:#64748b;border-top:1px solid #334155}@media print{body{background:none}.card{box-shadow:none}}</style></head><body>
      <div class="card"><div class="header"><h2>🛡️ Triple A Tech Solutions</h2><p>Security & Technology</p></div>
      <div class="body"><div class="photo">${emp.photo_url ? `<img src="${emp.photo_url}" />` : "👤"}</div>
      <div class="name">${emp.name}</div><div class="role">${emp.role}</div>
      <div class="details">${emp.phone ? `📞 ${emp.phone}<br/>` : ""}${emp.email ? `✉️ ${emp.email}<br/>` : ""}ID: ${emp.qr_code.slice(0, 8).toUpperCase()}</div>
      <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}" width="120" height="120" /></div></div>
      <div class="footer">Scan QR code to verify employee · ${new Date().getFullYear()}</div></div>
      <script>setTimeout(()=>window.print(),500)<\/script></body></html>`);
    printWindow.document.close();
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (isAdmin === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-primary font-display">Verifying access...</div></div>;
  }

  const unreadMessages = messages.filter(m => !m.is_read).length;

  const tabs: { key: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "services", label: "Services", icon: ShieldCheck },
    { key: "whyus", label: "Why Us", icon: Award },
    { key: "portfolio", label: "Portfolio", icon: Image },
    { key: "team", label: "Team", icon: Users },
    { key: "testimonials", label: "Reviews", icon: Star, badge: testimonials.filter(t => !t.approved).length },
    { key: "messages", label: "Messages", icon: Mail, badge: unreadMessages },
    { key: "employees", label: "Employees", icon: Briefcase },
    { key: "users", label: "Users", icon: Users },
    { key: "profile", label: "Profile", icon: Settings },
  ];

  const renderIconSelect = (value: string, onChange: (v: string) => void) => (
    <div className="space-y-2">
      <Label>Icon</Label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
        {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
    </div>
  );

  const getEmpStatus = (emp: any) => {
    if (emp.is_active) return "active";
    if (emp.suspended_at && !emp.released_at) return "suspended";
    return "released";
  };

  const filteredEmployees = empFilter === "all" ? employees
    : empFilter === "active" ? employees.filter(e => e.is_active)
    : empFilter === "suspended" ? employees.filter(e => !e.is_active && e.suspended_at && !e.released_at)
    : employees.filter(e => !e.is_active && e.released_at);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Admin avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/30">
              {adminProfile?.avatar_url ? (
                <img src={adminProfile.avatar_url} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>View Site</Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-1" /> Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Sticky tab bar */}
      <div className="sticky top-14 z-40 bg-background border-b border-border">
        <div className="container px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {tabs.map(t => (
              <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)} className="shrink-0 relative">
                <t.icon className="w-4 h-4 mr-1" />
                {t.label}
                {t.badge && t.badge > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{t.badge}</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="container px-4 py-6 flex-1">

        {/* SERVICES TAB */}
        {tab === "services" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Services ({services.length})</h2>
              <Button size="sm" onClick={() => { setEditItem({ icon: "Shield", title: "", description: "", category: "physical", display_order: 0 }); setEditDialog("services"); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Service
              </Button>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {services.map(s => {
                const Icon = iconMap[s.icon] || Shield;
                return (
                  <div key={s.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.category} · Order: {s.display_order}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setEditItem(s); setEditDialog("services"); }}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteService(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
              {services.length === 0 && <p className="text-muted-foreground text-sm">No services yet.</p>}
            </div>
          </div>
        )}

        {/* WHY US TAB */}
        {tab === "whyus" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Why Triple A Cards ({whyUsCards.length})</h2>
              <Button size="sm" onClick={() => { setEditItem({ icon: "Star", title: "", description: "", display_order: 0 }); setEditDialog("whyus"); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Card
              </Button>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {whyUsCards.map(c => {
                const Icon = iconMap[c.icon] || Star;
                return (
                  <div key={c.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.description.slice(0, 60)}...</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setEditItem(c); setEditDialog("whyus"); }}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteWhyUs(c.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Portfolio ({portfolioWorks.length})</h2>
              <Button size="sm" onClick={() => { setEditItem({ title: "", description: "", image_url: "", video_url: "", external_url: "", display_order: 0 }); setEditDialog("portfolio"); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Work
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {portfolioWorks.map(w => (
                <div key={w.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {w.image_url && <img src={w.image_url} alt={w.title} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <p className="font-semibold text-sm">{w.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{w.description.slice(0, 80)}</p>
                    <div className="flex gap-2 mt-2">
                      {w.video_url && <span className="text-xs text-primary flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                      {w.external_url && <span className="text-xs text-primary flex items-center gap-1"><Link className="w-3 h-3" /> URL</span>}
                    </div>
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="ghost" onClick={() => { setEditItem(w); setEditDialog("portfolio"); }}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePortfolio(w.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {tab === "testimonials" && (
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Testimonials ({testimonials.length})</h2>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
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
                        {Array.from({ length: t.rating || 0 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                      </div>
                      <p className="text-sm text-muted-foreground">{t.content}</p>
                    </div>
                    <div className="flex gap-1 ml-4 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleApproval(t.id, t.approved)}>
                        {t.approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTestimonial(t.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === "messages" && (
          <div>
            <h2 className="font-display font-bold text-lg mb-4">
              Messages ({messages.length}) {unreadMessages > 0 && <span className="text-destructive">· {unreadMessages} unread</span>}
            </h2>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {messages.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border ${m.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {m.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" /> : <Mail className="w-4 h-4 text-primary shrink-0" />}
                        <p className="font-semibold text-sm">{m.name}</p>
                        <span className="text-xs text-muted-foreground truncate">{m.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">📞 {m.phone}</p>
                      <p className="text-sm text-muted-foreground">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1 ml-4 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleRead(m.id, m.is_read)}>
                        {m.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMessage(m.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-muted-foreground text-sm">No messages yet.</p>}
            </div>
          </div>
        )}

        {/* EMPLOYEES TAB */}
        {tab === "employees" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Employees ({filteredEmployees.length})</h2>
              <Button size="sm" onClick={() => { setEditItem({ name: "", role: "", phone: "", email: "", photo_url: "", is_active: true }); setEditDialog("employees"); }}>
                <UserPlus className="w-4 h-4 mr-1" /> Add Employee
              </Button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {([
                { key: "all", label: "All", count: employees.length },
                { key: "active", label: "Active", count: employees.filter(e => e.is_active).length },
                { key: "suspended", label: "Suspended", count: employees.filter(e => !e.is_active && e.suspended_at && !e.released_at).length },
                { key: "released", label: "Released", count: employees.filter(e => !e.is_active && e.released_at).length },
              ] as const).map(f => (
                <Button key={f.key} size="sm" variant={empFilter === f.key ? "default" : "outline"} onClick={() => setEmpFilter(f.key)} className="rounded-xl">
                  {f.label} ({f.count})
                </Button>
              ))}
            </div>
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredEmployees.map(emp => {
                const status = getEmpStatus(emp);
                return (
                  <div key={emp.id} className={`p-4 rounded-xl border ${
                    status === "active" ? "border-border bg-card" :
                    status === "suspended" ? "border-yellow-500/30 bg-yellow-500/5" :
                    "border-destructive/30 bg-destructive/5"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {emp.photo_url ? (
                          <img src={emp.photo_url} alt={emp.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-primary" /></div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.role}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            status === "active" ? "bg-primary/20 text-primary" :
                            status === "suspended" ? "bg-yellow-500/20 text-yellow-600" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            {status === "active" ? "Active" : status === "suspended" ? "Suspended" : "Released"}
                          </span>
                          {status === "released" && emp.released_at && (
                            <p className="text-xs text-destructive mt-1">Released: {new Date(emp.released_at).toLocaleString()}</p>
                          )}
                          {status === "suspended" && emp.suspended_at && (
                            <p className="text-xs text-yellow-600 mt-1">Suspended: {new Date(emp.suspended_at).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                        <Button size="sm" variant="ghost" onClick={() => printEmployeeCard(emp)} title="Print ID Card"><Printer className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditItem(emp); setEditDialog("employees"); }}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRecordDialog(emp.id); fetchRecords(emp.id); }} title="Records"><FileText className="w-4 h-4" /></Button>
                        {emp.is_active && (
                          <>
                            <Button size="sm" variant="ghost" className="text-yellow-600" onClick={() => suspendEmployee(emp.id)} title="Suspend">
                              <PauseCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => releaseEmployee(emp.id)} title="Release">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {!emp.is_active && (
                          <Button size="sm" variant="ghost" className="text-primary" onClick={() => reinstateEmployee(emp.id)} title="Reinstate">
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>QR: {emp.qr_code.slice(0, 8)}...</span>
                    </div>
                  </div>
                );
              })}
              {filteredEmployees.length === 0 && <p className="text-center text-muted-foreground py-8">No {empFilter} employees found.</p>}
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {tab === "team" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Team Members ({teamMembers.length})</h2>
              <Button size="sm" onClick={() => { setEditItem({ name: "", role: "", bio: "", photo_url: "", display_order: 0, is_visible: true }); setEditDialog("team"); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Member
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">These members appear on the About Us page.</p>
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {teamMembers.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border ${m.is_visible ? "border-border bg-card" : "border-border bg-muted/50 opacity-60"} flex items-center justify-between`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><User className="w-6 h-6 text-primary" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                      {m.bio && <p className="text-xs text-muted-foreground truncate max-w-xs">{m.bio.slice(0, 80)}...</p>}
                      {!m.is_visible && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => { setEditItem(m); setEditDialog("team"); }}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTeamMember(m.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No team members yet. Add members to show on the About Us page.</p>}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Users ({users.length})</h2>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{u.display_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div className="max-w-md">
            <h2 className="font-display font-bold text-lg mb-4">Admin Profile</h2>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/30 overflow-hidden">
                    {adminProfile?.avatar_url ? (
                      <img src={adminProfile.avatar_url} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Hover & click to change photo</p>
              </div>
              <p className="text-center text-sm text-muted-foreground">{adminUser?.email}</p>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>New Password (leave blank to keep current)</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="rounded-xl" />
              </div>
              <Button onClick={updateProfile} disabled={profileLoading} className="w-full">
                <Save className="w-4 h-4 mr-1" /> {profileLoading ? "Saving..." : "Update Profile"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT DIALOGS */}
      <Dialog open={editDialog === "services"} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              {renderIconSelect(editItem.icon, v => setEditItem({ ...editItem, icon: v }))}
              <div className="space-y-2"><Label>Title</Label><Input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
                  <option value="physical">Physical Security</option><option value="cyber">Cyber Security</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={editItem.display_order} onChange={e => setEditItem({ ...editItem, display_order: parseInt(e.target.value) || 0 })} className="rounded-xl" /></div>
              <Button onClick={() => saveService(editItem)} className="w-full"><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog === "whyus"} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit" : "Add"} Why Us Card</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              {renderIconSelect(editItem.icon, v => setEditItem({ ...editItem, icon: v }))}
              <div className="space-y-2"><Label>Title</Label><Input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={editItem.display_order} onChange={e => setEditItem({ ...editItem, display_order: parseInt(e.target.value) || 0 })} className="rounded-xl" /></div>
              <Button onClick={() => saveWhyUs(editItem)} className="w-full"><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog === "portfolio"} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit" : "Add"} Portfolio Work</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) { const url = await handleImageUpload(file); if (url) setEditItem({ ...editItem, image_url: url }); }
                }} className="rounded-xl" />
                {editItem.image_url && <img src={editItem.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />}
              </div>
              <div className="space-y-2"><Label>Video URL</Label><Input value={editItem.video_url || ""} onChange={e => setEditItem({ ...editItem, video_url: e.target.value })} placeholder="https://youtube.com/..." className="rounded-xl" /></div>
              <div className="space-y-2"><Label>External URL</Label><Input value={editItem.external_url || ""} onChange={e => setEditItem({ ...editItem, external_url: e.target.value })} placeholder="https://..." className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={editItem.display_order} onChange={e => setEditItem({ ...editItem, display_order: parseInt(e.target.value) || 0 })} className="rounded-xl" /></div>
              <Button onClick={() => savePortfolio(editItem)} className="w-full"><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog === "employees"} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit" : "Add"} Employee</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editItem.name} onChange={e => {
                  const name = e.target.value;
                  const parts = name.trim().split(/\s+/);
                  const autoEmail = parts.length >= 2 ? `${parts[0].toLowerCase()}.${parts.slice(1).join('').toLowerCase()}@tripleaatech.co.ke`
                    : parts.length === 1 && parts[0] ? `${parts[0].toLowerCase()}@tripleaatech.co.ke` : "";
                  setEditItem({ ...editItem, name, email: autoEmail });
                }} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Role / Position</Label>
                <select value={editItem.role} onChange={e => setEditItem({ ...editItem, role: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
                  <option value="">Select a role...</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Security Supervisor">Security Supervisor</option>
                  <option value="CCTV Operator">CCTV Operator</option>
                  <option value="IT Technician">IT Technician</option>
                  <option value="Network Engineer">Network Engineer</option>
                  <option value="Cyber Security Analyst">Cyber Security Analyst</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Field Technician">Field Technician</option>
                  <option value="Driver">Driver</option>
                  <option value="Admin Assistant">Admin Assistant</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editItem.phone || ""} onChange={e => setEditItem({ ...editItem, phone: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editItem.email || ""} readOnly className="rounded-xl bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Auto-generated from name</p>
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) { const url = await handleImageUpload(file); if (url) setEditItem({ ...editItem, photo_url: url }); }
                }} className="rounded-xl" />
                {editItem.photo_url && <img src={editItem.photo_url} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
              </div>
              {editItem.id && (
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <input type="checkbox" checked={editItem.is_active} onChange={e => setEditItem({ ...editItem, is_active: e.target.checked })} />
                </div>
              )}
              <Button onClick={() => saveEmployee(editItem)} className="w-full"><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Records Dialog */}
      <Dialog open={!!recordDialog} onOpenChange={() => setRecordDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Records</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add new record form */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <p className="font-semibold text-sm">Add New Record</p>
              <div className="space-y-2">
                <Label>Type</Label>
                <select value={newRecord.record_type} onChange={e => setNewRecord({ ...newRecord, record_type: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm">
                  <option value="note">Note</option>
                  <option value="warning">Warning</option>
                  <option value="incident">Incident</option>
                  <option value="commendation">Commendation</option>
                  <option value="disciplinary">Disciplinary</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Title</Label><Input value={newRecord.title} onChange={e => setNewRecord({ ...newRecord, title: e.target.value })} placeholder="Brief title..." className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={newRecord.description} onChange={e => setNewRecord({ ...newRecord, description: e.target.value })} placeholder="Details..." className="rounded-xl" /></div>
              <Button size="sm" onClick={() => recordDialog && addRecord(recordDialog)} disabled={!newRecord.title.trim()}>
                <Plus className="w-4 h-4 mr-1" /> Add Record
              </Button>
            </div>

            {/* Existing records */}
            <div className="space-y-2">
              {empRecords.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No records yet.</p>}
              {empRecords.map(r => (
                <div key={r.id} className={`p-3 rounded-lg border text-sm ${
                  r.record_type === "warning" ? "border-yellow-500/30 bg-yellow-500/5" :
                  r.record_type === "incident" || r.record_type === "disciplinary" ? "border-destructive/30 bg-destructive/5" :
                  r.record_type === "commendation" ? "border-primary/30 bg-primary/5" :
                  "border-border bg-card"
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.record_type === "warning" ? "bg-yellow-500/20 text-yellow-600" :
                        r.record_type === "incident" || r.record_type === "disciplinary" ? "bg-destructive/20 text-destructive" :
                        r.record_type === "commendation" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>{r.record_type}</span>
                      <p className="font-semibold mt-1">{r.title}</p>
                      {r.description && <p className="text-muted-foreground mt-1">{r.description}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => recordDialog && deleteRecord(r.id, recordDialog)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Edit Dialog */}
      <Dialog open={editDialog === "team"} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit" : "Add"} Team Member</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Role / Title</Label><Input value={editItem.role} onChange={e => setEditItem({ ...editItem, role: e.target.value })} placeholder="e.g. Co-Founder, Operations Lead" className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Bio / Message</Label><Textarea value={editItem.bio || ""} onChange={e => setEditItem({ ...editItem, bio: e.target.value })} placeholder="Short bio or personal message..." className="rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <Input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) { const url = await handleImageUpload(file); if (url) setEditItem({ ...editItem, photo_url: url }); }
                }} className="rounded-xl" />
                {editItem.photo_url && <img src={editItem.photo_url} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
              </div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={editItem.display_order} onChange={e => setEditItem({ ...editItem, display_order: parseInt(e.target.value) || 0 })} className="rounded-xl" /></div>
              {editItem.id && (
                <div className="flex items-center gap-2">
                  <Label>Visible on About page</Label>
                  <input type="checkbox" checked={editItem.is_visible} onChange={e => setEditItem({ ...editItem, is_visible: e.target.checked })} />
                </div>
              )}
              <Button onClick={() => saveTeamMember(editItem)} className="w-full"><Save className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
