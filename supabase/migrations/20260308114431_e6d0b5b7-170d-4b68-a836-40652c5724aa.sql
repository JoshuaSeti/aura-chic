
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Site settings manageable by admins"
ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES (
  'hero',
  '{"subtitle": "New Collection 2026", "title": "Elegance\nRedefined", "description": "Discover curated luxury pieces that embody sophistication and timeless style.", "cta_text": "Shop Now", "cta_link": "/shop", "image_url": ""}'::jsonb
);
