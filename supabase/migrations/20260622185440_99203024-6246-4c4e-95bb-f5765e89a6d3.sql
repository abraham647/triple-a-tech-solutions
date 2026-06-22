-- Add employee role for login-enabled staff accounts
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';

-- Allow employees to read their own employee record (so the app can gate access on is_active)
CREATE POLICY "Employees can view own record" ON public.employees
FOR SELECT USING (auth.uid() = user_id);

-- Allow employees to read their own records (notes/warnings/etc.)
CREATE POLICY "Employees can view own records" ON public.employee_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_records.employee_id AND e.user_id = auth.uid()
  )
);