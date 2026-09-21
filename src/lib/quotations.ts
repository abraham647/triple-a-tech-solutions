// Link out to the Smart Infrastructure Designer project, which produces client quotations.
export const QUOTATION_APP_URL = "https://infra-designr.lovable.app";

type QuotationSeed = {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  amount?: number | null;
  delivery_notes?: string | null;
  id?: string | null;
};

// Details travel as query params so the designer can prefill them if it supports it.
export const buildQuotationUrl = (order: QuotationSeed = {}) => {
  const params = new URLSearchParams();
  const put = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  };
  put("source", "tripleatech-site");
  put("ref", order.id);
  put("client_name", order.customer_name);
  put("client_phone", order.customer_phone);
  put("client_email", order.customer_email);
  put("item", order.product_name);
  put("quantity", order.quantity);
  put("amount", order.amount);
  put("notes", order.delivery_notes);
  const qs = params.toString();
  return qs ? `${QUOTATION_APP_URL}/?${qs}` : QUOTATION_APP_URL;
};

export const openQuotationApp = (order?: QuotationSeed) => {
  window.open(buildQuotationUrl(order), "_blank", "noopener,noreferrer");
};
