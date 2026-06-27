-- Restrict direct EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_my_employee_profile(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_employee_profile(text, text, text) TO authenticated;

-- Prevent clients from listing all files in the public "uploads" bucket.
-- Public file access continues to work via the public storage URL/CDN; only the
-- ability to enumerate/list objects through the API is removed.
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;