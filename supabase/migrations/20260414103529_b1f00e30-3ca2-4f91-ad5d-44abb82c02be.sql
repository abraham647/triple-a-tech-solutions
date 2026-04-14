
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Sales agents can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'sales_agent'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries" ON public.product_inquiries FOR INSERT WITH CHECK (length(trim(customer_name)) > 0 AND length(trim(customer_email)) > 0);
CREATE POLICY "Admins can manage inquiries" ON public.product_inquiries FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers can manage inquiries" ON public.product_inquiries FOR ALL USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Sales agents can manage inquiries" ON public.product_inquiries FOR ALL USING (public.has_role(auth.uid(), 'sales_agent'));

CREATE TRIGGER update_product_inquiries_updated_at BEFORE UPDATE ON public.product_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'team';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;

CREATE POLICY "Managers can view employees" ON public.employees FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Technicians can view employees" ON public.employees FOR SELECT USING (public.has_role(auth.uid(), 'technician'));
CREATE POLICY "Managers can view contact messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Managers can view employee records" ON public.employee_records FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Technicians can view employee records" ON public.employee_records FOR SELECT USING (public.has_role(auth.uid(), 'technician'));
