CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL DEFAULT '',
  delivery_notes text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'mpesa',
  merchant_request_id text,
  checkout_request_id text,
  mpesa_receipt text,
  result_desc text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (length(trim(customer_name)) > 0 AND length(trim(customer_phone)) > 0 AND quantity > 0);

CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can manage orders"
ON public.orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Sales agents can manage orders"
ON public.orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'sales_agent'::app_role))
WITH CHECK (has_role(auth.uid(), 'sales_agent'::app_role));

CREATE INDEX idx_orders_checkout_request_id ON public.orders(checkout_request_id);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();