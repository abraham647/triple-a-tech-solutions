
-- Drop the overly permissive policy
DROP POLICY "Anyone can submit testimonials" ON public.testimonials;

-- Replace with a slightly scoped policy (still public but requires content)
CREATE POLICY "Anyone can submit testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND length(trim(content)) > 0
  );
