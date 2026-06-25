-- Add multiple images support to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

-- About Us content sections
CREATE TABLE IF NOT EXISTS public.about_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  content text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.about_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_sections TO authenticated;
GRANT ALL ON public.about_sections TO service_role;

ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "About sections are viewable by everyone"
ON public.about_sections FOR SELECT
USING (true);

CREATE POLICY "Admins can insert about sections"
ON public.about_sections FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update about sections"
ON public.about_sections FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete about sections"
ON public.about_sections FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_about_sections_updated_at
BEFORE UPDATE ON public.about_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();