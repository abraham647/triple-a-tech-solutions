REVOKE EXECUTE ON FUNCTION public.verify_employee_qr(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_employee_qr(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_employee_qr(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_employee_qr(text) TO service_role;