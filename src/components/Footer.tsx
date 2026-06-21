import { Shield, Star, Send, Share2, Phone, Mail as MailIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Footer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin secret click
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleShieldClick = useCallback(() => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 4) {
      clickCount.current = 0;
      setAdminOpen(true);
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth failed");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Unauthorized: Not an admin");
      }
      setAdminOpen(false);
      navigate("/admin");
    } catch (error: any) {
      toast({ title: "Access Denied", description: error.message, variant: "destructive" });
    } finally {
      setAdminLoading(false);
    }
  };

  // Testimonial form
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tContent, setTContent] = useState("");
  const [tRating, setTRating] = useState(5);
  const [tLoading, setTLoading] = useState(false);

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tContent.trim()) return;
    setTLoading(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        name: tName.trim(),
        role: tRole.trim() || null,
        content: tContent.trim(),
        rating: tRating,
      });
      if (error) throw error;
      toast({ title: "Thank you!", description: "Your testimonial has been submitted for review." });
      setTName(""); setTRole(""); setTContent(""); setTRating(5);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTLoading(false);
    }
  };

  const shareUrl = encodeURIComponent(window.location.origin);
  const shareText = encodeURIComponent("Check out Triple A Tech Solutions – Kenya's trusted security & technology partner!");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <footer className="border-t border-border py-12 bg-secondary/20">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer select-none"
                  onClick={handleShieldClick}
                >
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-lg">Triple A Tech</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
                Kenya's trusted security & technology solutions partner. Protecting what matters most.
              </p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <a href="tel:+254112860205" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +254 112 860 205
                </a>
                <a href="https://wa.me/254732695197" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +254 732 695 197 (WhatsApp)
                </a>
                <a href="mailto:info@tripleaatech.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <MailIcon className="w-3.5 h-3.5" /> info@tripleaatech.com
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: "Services", action: () => scrollTo("services") },
                  { label: "Our Work", action: () => scrollTo("our-work") },
                  { label: "About Us", action: () => goTo("/about") },
                  { label: "Contact", action: () => scrollTo("contact") },
                ].map(link => (
                  <button key={link.label} onClick={link.action} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </button>
                ))}
              </div>
              <h4 className="font-display font-semibold mt-5 mb-3">Company</h4>
              <div className="space-y-2">
                {[
                  { label: "Careers", action: () => goTo("/careers") },
                  { label: "Privacy Policy", action: () => goTo("/privacy") },
                  { label: "Terms of Service", action: () => goTo("/terms") },
                ].map(link => (
                  <button key={link.label} onClick={link.action} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonial Form */}
            <div>
              <h4 className="font-display font-semibold mb-3">Leave a Testimonial</h4>
              <form onSubmit={submitTestimonial} className="space-y-2">
                <Input placeholder="Your name" value={tName} onChange={e => setTName(e.target.value)} required className="h-8 text-xs rounded-lg" />
                <Input placeholder="Your role (optional)" value={tRole} onChange={e => setTRole(e.target.value)} className="h-8 text-xs rounded-lg" />
                <Textarea placeholder="Your experience with us..." value={tContent} onChange={e => setTContent(e.target.value)} required className="text-xs min-h-[60px] rounded-lg" />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} onClick={() => setTRating(n)}>
                      <Star className={`w-4 h-4 ${n <= tRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={tLoading}>
                  <Send className="w-3 h-3 mr-1" /> {tLoading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </div>

            {/* Social & Share */}
            <div>
              <h4 className="font-display font-semibold mb-3">Connect & Share</h4>
              <div className="flex items-center gap-3 mb-4">
                <a href="https://www.instagram.com/triple.atechsolutions?igsh=cTBjYWFjOXJodHB5" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://wa.me/254112860205" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 transition-all" aria-label="WhatsApp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="tel:+254112860205" className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all" aria-label="Call us">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Share with friends</p>
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    <Share2 className="w-3 h-3" /> WhatsApp
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    <Share2 className="w-3 h-3" /> Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Triple A Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admin Login Dialog */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Admin Access</DialogTitle>
            <DialogDescription>Enter admin credentials to continue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full" disabled={adminLoading}>
              {adminLoading ? "Verifying..." : "Login as Admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
