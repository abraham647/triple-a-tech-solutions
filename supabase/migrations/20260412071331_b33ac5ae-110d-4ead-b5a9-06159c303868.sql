
-- Add suspended_at to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS suspended_at timestamptz DEFAULT NULL;

-- Create employee_records table
CREATE TABLE public.employee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  record_type text NOT NULL DEFAULT 'note',
  title text NOT NULL,
  description text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employee records"
ON public.employee_records FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
