
-- Fix permissive INSERT policy on contact_messages
DROP POLICY "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages 
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND 
    length(trim(email)) > 0 AND 
    length(trim(phone)) > 0 AND 
    length(trim(message)) > 0
  );
