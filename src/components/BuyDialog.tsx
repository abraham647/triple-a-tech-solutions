import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, CheckCircle2, XCircle, Smartphone, Landmark, Truck, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/components/ProductsSection";

type Method = "mpesa" | "bank_transfer" | "cash_on_delivery";

const base = {
  customer_name: z.string().trim().min(1, "Name is required").max(120),
  customer_email: z.string().trim().max(255).optional(),
  delivery_notes: z.string().trim().max(1000).optional(),
  quantity: z.number().int().min(1, "Minimum 1").max(100),
};

const mpesaSchema = z.object({
  ...base,
  customer_phone: z
    .string()
    .trim()
    .regex(/^(?:\+?254|0)(?:7|1)\d{8}$/, "Enter a valid Safaricom number, e.g. 0712345678"),
});

const manualSchema = z.object({
  ...base,
  customer_phone: z.string().trim().min(7, "Phone number is required").max(20),
});

type Stage = "form" | "waiting" | "paid" | "submitted" | "failed";

interface Props {
  product: any | null;
  open: boolean;
  onClose: () => void;
}

const METHODS: { value: Method; label: string; hint: string }[] = [
  { value: "mpesa", label: "M-Pesa (instant prompt)", hint: "We send a payment request to your phone — you just enter your M-Pesa PIN." },
  { value: "bank_transfer", label: "Bank transfer", hint: "We confirm your order and share our bank details, then release the goods once payment clears." },
  { value: "cash_on_delivery", label: "Pay on delivery", hint: "Pay a 50% deposit now via M-Pesa prompt, then the balance when your order arrives." },
];

const BuyDialog = ({ product, open, onClose }: Props) => {
  const { toast } = useToast();
  const [method, setMethod] = useState<Method>("mpesa");
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", delivery_notes: "" });
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { if (open && product?.initialQuantity) setQuantity(product.initialQuantity); }, [open, product?.initialQuantity]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unitPrice = Number(product?.price ?? 0);
  const total = unitPrice * quantity;
  const isDeposit = method === "cash_on_delivery";
  const deposit = Math.max(1, Math.ceil(total / 2));
  const activeMethod = METHODS.find(m => m.value === method)!;

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
      setReference(null);
      setFailReason("");
      setMethod("mpesa");
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
    const schema = method === "bank_transfer" ? manualSchema : mpesaSchema;
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

    const payload = {
      product_id: product?.id ?? null,
      product_name: product?.name ?? "",
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_email: form.customer_email?.trim() ?? "",
      delivery_notes: form.delivery_notes?.trim() ?? "",
      quantity,
      amount: unitPrice,
    };

    // Reads the real message the function returned, even on a non-2xx response.
    const call = async (fn: string, body: any) => {
      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) {
        let detail = error.message;
        const res = (error as any)?.context;
        if (res && typeof res.text === "function") {
          const raw = await res.text().catch(() => "");
          try {
            const parsed = JSON.parse(raw);
            detail = parsed.error ?? parsed.message ?? raw ?? detail;
          } catch {
            if (raw) detail = raw;
          }
        }
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      const d = data as any;
      if (d?.error) throw new Error(typeof d.error === "string" ? d.error : JSON.stringify(d.error));
      return d;
    };

    try {
      if (method === "mpesa" || method === "cash_on_delivery") {
        const data = await call("mpesa-stkpush", {
          ...payload,
          payment_method: method,
          ...(isDeposit ? { charge_amount: deposit } : {}),
        });
        setStage("waiting");
        startPolling(data.order_id);
      } else {
        const data = await call("create-order", { ...payload, payment_method: method });
        setReference(data.reference ?? null);
        setStage("submitted");
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      toast({ title: "Could not place the order", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const MethodIcon = method === "mpesa" ? Smartphone : method === "bank_transfer" ? Landmark : Truck;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? `Buy ${product.name}` : "Place an order"}</DialogTitle>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-bold text-primary">{formatPrice(total)}</span>
              </div>
              {isDeposit && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">50% deposit due now</span>
                  <span className="font-semibold text-foreground">{formatPrice(deposit)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={method} onValueChange={(v) => { setMethod(v as Method); setErrors({}); }}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs flex items-start gap-1.5">
                <MethodIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {activeMethod.hint}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl" />
              {errors.customer_name && <p className="text-destructive text-xs">{errors.customer_name}</p>}
            </div>

            <div className="space-y-2">
              <Label>{method === "bank_transfer" ? "Phone Number" : "M-Pesa Phone Number"}</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="0712345678"
                className="rounded-xl"
              />
              <p className="text-muted-foreground text-xs">
                {method === "bank_transfer"
                  ? "We'll call or WhatsApp you on this number to confirm."
                  : isDeposit
                    ? `You'll get an M-Pesa prompt for the 50% deposit (${formatPrice(deposit)}) on this number.`
                    : "You'll get a payment prompt on this number."}
              </p>
              {errors.customer_phone && <p className="text-destructive text-xs">{errors.customer_phone}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email {method === "bank_transfer" ? "(for your invoice)" : "(optional)"}</Label>
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
              <Label>{method === "cash_on_delivery" ? "Delivery address" : "Delivery details / notes"}</Label>
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {method === "bank_transfer" ? "Placing order..." : "Sending prompt..."}</>
              ) : isDeposit ? (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Pay 50% deposit — {formatPrice(deposit)}</>
              ) : method === "mpesa" ? (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Pay {formatPrice(total)} with M-Pesa</>
              ) : (
                <><ShoppingCart className="w-4 h-4 mr-2" /> Place order — {formatPrice(total)}</>
              )}
            </Button>

            <p className="text-muted-foreground text-xs flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout — we never ask for your PIN or card details.
            </p>
          </div>
        )}

        {stage === "waiting" && (
          <div className="py-8 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <h3 className="font-display font-semibold text-lg">Check your phone</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {isDeposit
                ? `Enter your M-Pesa PIN to pay the 50% deposit of ${formatPrice(deposit)} on the prompt sent to ${form.customer_phone}.`
                : `Enter your M-Pesa PIN on the prompt sent to ${form.customer_phone}.`} Keep this window open — we'll confirm here.
            </p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}

        {stage === "paid" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h3 className="font-display font-semibold text-lg">{isDeposit ? "Deposit received" : "Payment successful"}</h3>
            <p className="text-muted-foreground text-sm">
              {isDeposit
                ? `${formatPrice(deposit)} deposit received${receipt ? ` — M-Pesa code ${receipt}` : ""}. You'll pay the balance of ${formatPrice(total - deposit)} when your order arrives.`
                : `${formatPrice(total)} received${receipt ? ` — M-Pesa code ${receipt}` : ""}. Our team has been notified and will contact you about delivery.`}
            </p>
            <Button onClick={onClose} className="rounded-xl">Done</Button>
          </div>
        )}

        {stage === "submitted" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h3 className="font-display font-semibold text-lg">Order received</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {method === "bank_transfer"
                ? `We've received your order of ${formatPrice(total)}. Our team will contact you shortly with the bank details and your invoice.`
                : `We've received your order of ${formatPrice(total)}. Our team will call you to confirm delivery, and you pay when it arrives.`}
            </p>
            {reference && <p className="text-sm">Your reference: <span className="font-display font-bold text-primary">{reference}</span></p>}
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
