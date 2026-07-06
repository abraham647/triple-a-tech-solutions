
-- 1) Scope all has_role-based policies to authenticated so anonymous users never evaluate the role-check function
ALTER POLICY "Admins can manage contact messages" ON public.contact_messages TO authenticated;
ALTER POLICY "Admins can view contact messages" ON public.contact_messages TO authenticated;
ALTER POLICY "Managers can view contact messages" ON public.contact_messages TO authenticated;

ALTER POLICY "Admins can manage employee records" ON public.employee_records TO authenticated;
ALTER POLICY "Managers can view employee records" ON public.employee_records TO authenticated;
ALTER POLICY "Technicians can view employee records" ON public.employee_records TO authenticated;

ALTER POLICY "Admins can manage employees" ON public.employees TO authenticated;
ALTER POLICY "Managers can view employees" ON public.employees TO authenticated;
ALTER POLICY "Technicians can view employees" ON public.employees TO authenticated;

ALTER POLICY "Admins can manage portfolio works" ON public.portfolio_works TO authenticated;

ALTER POLICY "Admins can manage inquiries" ON public.product_inquiries TO authenticated;
ALTER POLICY "Managers can manage inquiries" ON public.product_inquiries TO authenticated;
ALTER POLICY "Sales agents can manage inquiries" ON public.product_inquiries TO authenticated;

ALTER POLICY "Admins can manage products" ON public.products TO authenticated;
ALTER POLICY "Managers can manage products" ON public.products TO authenticated;
ALTER POLICY "Sales agents can manage products" ON public.products TO authenticated;

ALTER POLICY "Admins can manage services" ON public.services TO authenticated;

ALTER POLICY "Admins can manage team members" ON public.team_members TO authenticated;

ALTER POLICY "Admins can manage testimonials" ON public.testimonials TO authenticated;
ALTER POLICY "Admins can view all testimonials" ON public.testimonials TO authenticated;

ALTER POLICY "Admins can manage roles" ON public.user_roles TO authenticated;
ALTER POLICY "Admins can view all roles" ON public.user_roles TO authenticated;

ALTER POLICY "Admins can manage why us cards" ON public.why_us_cards TO authenticated;

-- 2) Revoke anon EXECUTE on the SECURITY DEFINER role-check function (no longer needed by anon policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;

-- 3) Lock down profiles: remove public read, allow owner and admins only
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4) Restrict anon column access on employees to non-sensitive verification fields only
REVOKE SELECT ON public.employees FROM anon;
GRANT SELECT (id, name, role, photo_url, hired_at, is_active, qr_code) ON public.employees TO anon;
