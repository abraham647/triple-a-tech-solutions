-- Enable trigram matching so ILIKE '%term%' product searches can use an index
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Products: the hot path (public catalog listing + filtering + pagination)
CREATE INDEX IF NOT EXISTS idx_products_active_order
  ON public.products (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_products_active_category_order
  ON public.products (is_active, category, display_order);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm
  ON public.products USING gin (description gin_trgm_ops);

-- Testimonials: approved reviews, newest first
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_created
  ON public.testimonials (approved, created_at DESC);

-- Ordered content tables
CREATE INDEX IF NOT EXISTS idx_services_order
  ON public.services (display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_works_order
  ON public.portfolio_works (display_order);
CREATE INDEX IF NOT EXISTS idx_why_us_cards_order
  ON public.why_us_cards (display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_visible_order
  ON public.team_members (is_visible, display_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_visible_order
  ON public.about_sections (is_visible, display_order);

-- Admin dashboard reads
CREATE INDEX IF NOT EXISTS idx_product_inquiries_status_created
  ON public.product_inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product
  ON public.product_inquiries (product_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read_created
  ON public.contact_messages (is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_active_created
  ON public.employees (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_user_id
  ON public.employees (user_id);
CREATE INDEX IF NOT EXISTS idx_employee_records_employee_created
  ON public.employee_records (employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role
  ON public.user_roles (user_id, role);