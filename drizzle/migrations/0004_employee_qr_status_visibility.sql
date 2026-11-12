CREATE OR REPLACE FUNCTION public.verify_employee_qr(_qr_code text)
 RETURNS TABLE(id uuid, name text, role text, photo_url text, hired_at timestamp with time zone, is_active boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT e.id, e.name, e.role, e.photo_url, e.hired_at, e.is_active
  FROM public.employees e
  WHERE e.qr_code = _qr_code
    AND e.released_at IS NULL
  LIMIT 1
$function$;

REVOKE ALL ON FUNCTION public.verify_employee_qr(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_employee_qr(text) TO service_role;