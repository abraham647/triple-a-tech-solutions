import { Truck, RotateCcw } from "lucide-react";

/** Delivery & returns lines shown on product and cart pages. */
const DeliveryInfo = () => (
  <div className="space-y-3 mt-6 text-sm">
    <p className="flex items-center gap-3"><Truck className="w-5 h-5 text-primary shrink-0" /> Estimated delivery: <strong>Nairobi 1–2 days</strong>, rest of Kenya <strong>2–5 days</strong></p>
    <p className="flex items-center gap-3"><RotateCcw className="w-5 h-5 text-primary shrink-0" /> Return within <strong>7 days</strong> if the item is faulty and in original packaging.</p>
  </div>
);

export default DeliveryInfo;
