-- Allow employees to update only their own profile fields (name, phone, photo) — never email or active status
CREATE OR REPLACE FUNCTION public.update_my_employee_profile(
  p_name text,
  p_phone text,
  p_photo_url text
)
RETURNS public.employees
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.employees;
BEGIN
  UPDATE public.employees
  SET
    name = COALESCE(NULLIF(TRIM(p_name), ''), name),
    phone = p_phone,
    photo_url = p_photo_url,
    updated_at = now()
  WHERE user_id = auth.uid()
  RETURNING * INTO updated;

  IF updated.id IS NULL THEN
    RAISE EXCEPTION 'No employee profile found for current user';
  END IF;

  RETURN updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_employee_profile(text, text, text) TO authenticated;