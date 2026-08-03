import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, CheckCircle2, XCircle, Smartphone } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/components/ProductsSection";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(120),
  customer_phone: z
    .string()
    .trim()
    .regex(/^(?:\+?254|0)(?:7|1)\d{8}$/, "Enter a valid Safaricom number, e.g. 0712345678"),
  customer_email: z.string().trim().max(255).optional(),
  delivery_notes: z.string().trim().max(1000).optional(),
  quantity: z.number().int().min(1, "Minimum 1").max(100),
});

type Stage = "form" | "waiting" | "paid" | "failed";

interface Props {
  product: any | null;
  open: boolean;
  onClose: () => void;
}

const BuyDialog = ({ product, open, onClose }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", delivery_notes: "" });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unitPrice = Number(product?.price ?? 0);
  const total = unitPrice * quantity;

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  useEffect(() => {
    if (!open) {
      stopPolling();
      setStage("form");
      setSubmitting(false);
      setErrors({});
      setReceipt(null);
      setFailReason("");
    }
  }, [open]);

  const startPolling = (orderId: string) => {
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 4;
      const { data, error } = await supabase.functions.invoke("order-status", { body: { order_id: orderId } });
      if (!error && data?.status === "paid") {
        stopPolling();
        setReceipt(data.mpesa_receipt ?? null);
        setStage("paid");
        return;
      }
      if (!error && data?.status === "failed") {
        stopPolling();
        setFailReason(data.result_desc || "The payment was not completed.");
        setStage("failed");
        return;
      }
      if (elapsed >= 120) {
        stopPolling();
        setFailReason("We didn't receive a confirmation in time. If you entered your PIN, we'll follow up shortly.");
        setStage("failed");
      }
    }, 4000);
  };

  const submit = async () => {
    const result = schema.safeParse({ ...form, quantity });
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) fe[e.path[0] as string] = e.message;
      });
      setErrors(fe);
      return;
    }
    if (unitPrice <= 0) {
      toast({ title: "Price on request", description: "Please send an inquiry for this product instead.", variant: "destructive" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("mpesa-stkpush", {
        body: {
          product_id: product?.id ?? null,
          product_name: product?.name ?? "",
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          customer_email: form.customer_email?.trim() ?? "",
          delivery_notes: form.delivery_notes?.trim() ?? "",
          quantity,
          amount: unitPrice,
        },
      });
      if (error) throw new Error((data as any)?.error ?? error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      setStage("waiting");
      startPolling((data as any).order_id);
    } catch (err: any) {
      toast({ title: "Could not start payment", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? `Buy ${product.name}` : "Place an order"}</DialogTitle>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl" />
              {errors.customer_name && <p className="text-destructive text-xs">{errors.customer_name}</p>}
            </div>
            <div className="space-y-2">
              <Label>M-Pesa Phone Number</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="0712345678"
                className="rounded-xl"
              />
              <p className="text-muted-foreground text-xs">You'll get a payment prompt on this number.</p>
              {errors.customer_phone && <p className="text-destructive text-xs">{errors.customer_phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="rounded-xl"
              />
              {errors.quantity && <p className="text-destructive text-xs">{errors.quantity}</p>}
            </div>
            <div className="space-y-2">
              <Label>Delivery details / notes</Label>
              <Textarea
                rows={3}
                value={form.delivery_notes}
                onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })}
                placeholder="Where should we deliver? Any preferences?"
                className="rounded-xl resize-none"
              />
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full glow-primary rounded-xl">
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending prompt...</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Pay {formatPrice(total)} with M-Pesa</>
              )}
            </Button>
          </div>
        )}

        {stage === "waiting" && (
          <div className="py-8 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <h3 className="font-display font-semibold text-lg">Check your phone</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Enter your M-Pesa PIN on the prompt sent to {form.customer_phone}. Keep this window open — we'll confirm here.
            </p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}

        {stage === "paid" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h3 className="font-display font-semibold text-lg">Payment successful</h3>
            <p className="text-muted-foreground text-sm">
              {formatPrice(total)} received{receipt ? ` — M-Pesa code ${receipt}` : ""}. Our team has been notified and will contact you about delivery.
            </p>
            <Button onClick={onClose} className="rounded-xl">Done</Button>
          </div>
        )}

        {stage === "failed" && (
          <div className="py-8 text-center space-y-3">
            <XCircle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="font-display font-semibold text-lg">Payment not completed</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">{failReason}</p>
            <Button variant="outline" onClick={() => setStage("form")} className="rounded-xl">Try again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyDialog;
