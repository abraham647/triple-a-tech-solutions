import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  customer_phone: z.string().trim().min(1, "Phone is required").max(20),
  message: z.string().trim().max(2000),
});

interface Props {
  product: any | null;
  open: boolean;
  onClose: () => void;
}

const ProductInquiryDialog = ({ product, open, onClose }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const message = form.message || (product ? `I'm interested in: ${product.name}` : "");
    const result = schema.safeParse({ ...form, message });
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach(e => { if (e.path[0]) fe[e.path[0] as string] = e.message; });
      setErrors(fe);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const { error } = await supabase.from("product_inquiries").insert({
        product_id: product?.id ?? null,
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim(),
        message: message.trim(),
      });
      if (error) throw error;
      toast({ title: "Inquiry sent!", description: "We'll get back to you shortly." });
      setForm({ customer_name: "", customer_email: "", customer_phone: "", message: "" });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? `Inquire about ${product.name}` : "Product Inquiry"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl" />
            {errors.customer_name && <p className="text-destructive text-xs">{errors.customer_name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className="rounded-xl" />
            {errors.customer_email && <p className="text-destructive text-xs">{errors.customer_email}</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className="rounded-xl" />
            {errors.customer_phone && <p className="text-destructive text-xs">{errors.customer_phone}</p>}
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder={product ? `I'm interested in: ${product.name}` : "Tell us what you're looking for..."}
              className="rounded-xl resize-none"
            />
          </div>
          <Button onClick={submit} disabled={sending} className="w-full glow-primary rounded-xl">
            {sending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Inquiry</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInquiryDialog;
