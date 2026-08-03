import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Send, LogIn } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(20),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const contactInfo = [
  { icon: Phone, title: "Call Us", value: "0112 860 205", href: "tel:+254112860205" },
  { icon: Phone, title: "WhatsApp / Call", value: "0732 695 197", href: "https://wa.me/254732695197" },
  { icon: Mail, title: "Email Us", value: "info@tripleaatech.com", href: "mailto:info@tripleaatech.com" },
  { icon: MapPin, title: "Visit Us", value: "Nairobi, Kenya", href: null },
];

const ContactSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({ title: "Login Required", description: "Please sign in to send an inquiry.", variant: "destructive" });
      return;
    }
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      if (error) throw error;
      toast({ title: "Quote request sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <section id="contact" className="py-20 md:py-28 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-3xl" />
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Get In Touch</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display">Request a Free Quote</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {!session ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-card/50 border border-border text-center">
              <LogIn className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Login to Send Inquiry</h3>
              <p className="text-muted-foreground text-sm mb-4">You need to be signed in to submit a quote request.</p>
              <Button onClick={() => navigate("/auth")} className="glow-primary">
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input placeholder="Your Name" value={form.name} onChange={update("name")} className="bg-card border-border h-12 rounded-xl" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input placeholder="Email Address" type="email" value={form.email} onChange={update("email")} className="bg-card border-border h-12 rounded-xl" />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Input placeholder="Phone Number" value={form.phone} onChange={update("phone")} className="bg-card border-border h-12 rounded-xl" />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Textarea placeholder="Tell us about your security needs..." rows={5} value={form.message} onChange={update("message")} className="bg-card border-border resize-none rounded-xl" />
                {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full glow-primary rounded-xl h-12" disabled={sending}>
                {sending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Quote Request</>}
              </Button>
            </form>
          )}

          <div className="space-y-6 flex flex-col justify-center">
            {contactInfo.map(({ icon: Icon, title, value, href }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-card/50 border border-border hover:border-primary/20 transition-all">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-0.5">{title}</h4>
                  {href ? (
                    <a href={href} className="text-muted-foreground text-sm hover:text-primary transition-colors">{value}</a>
                  ) : (
                    <p className="text-muted-foreground text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
