ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS pos_ref text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS pos_role text,
  ADD COLUMN IF NOT EXISTS has_pos_access boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS employees_pos_ref_key ON public.employees (pos_ref) WHERE pos_ref IS NOT NULL;