
-- Remove the enumerable public SELECT policy and anon column grants
DROP POLICY IF EXISTS "Public can verify active employees by QR" ON public.employees;
REVOKE SELECT ON public.employees FROM anon;

-- Single-row, exact-match verification function (no roster enumeration, no qr_code returned)
CREATE OR REPLACE FUNCTION public.verify_employee_qr(_qr_code text)
RETURNS TABLE (
  id uuid,
  name text,
  role text,
  photo_url text,
  hired_at timestamptz,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.name, e.role, e.photo_url, e.hired_at, e.is_active
  FROM public.employees e
  WHERE e.qr_code = _qr_code
    AND e.is_active = true
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.verify_employee_qr(text) TO anon, authenticated;
