import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, LogOut, User, Phone, Mail, FileText, Save, KeyRound,
  CheckCircle, AlertCircle, Award, Clock,
} from "lucide-react";

const recordIcon: Record<string, React.ElementType> = {
  note: FileText, warning: AlertCircle, incident: AlertCircle,
  commendation: Award, disciplinary: AlertCircle,
};

const Employee = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "records" | "settings">("overview");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data: emp } = await supabase.from("employees").select("*").eq("user_id", user.id).maybeSingle();
      if (!emp) { navigate("/"); return; }
      if (!emp.is_active) {
        await supabase.auth.signOut();
        toast({ title: "Account deactivated", description: "Your account has been deactivated. Contact your administrator.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      setEmployee(emp);
      const { data: recs } = await supabase.from("employee_records").select("*").eq("employee_id", emp.id).order("created_at", { ascending: false });
      if (recs) setRecords(recs);
      setLoading(false);
    };
    init();
  }, [navigate, toast]);

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

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-primary font-display">Loading...</div></div>;
  }

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: User },
    { key: "records" as const, label: "My Records", icon: FileText },
    { key: "settings" as const, label: "Settings", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Employee Portal</span>
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

      <div className="container px-4 py-6 flex-1 max-w-2xl">
        {tab === "overview" && (
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
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <p className="text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{employee.email}</span></p>
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
