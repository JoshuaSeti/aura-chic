
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by authenticated users" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products: public read
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are manageable by authenticated users" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders: authenticated only
CREATE POLICY "Orders are viewable by authenticated users" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Orders are manageable by authenticated users" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.categories (name, slug, description) VALUES
('Dresses', 'dresses', 'Elegant dresses for every occasion'),
('Accessories', 'accessories', 'Luxury accessories to complete your look'),
('Outerwear', 'outerwear', 'Sophisticated coats and jackets'),
('Shoes', 'shoes', 'Premium footwear collection');

-- Seed featured products
INSERT INTO public.products (name, slug, description, price, compare_at_price, category_id, featured, sizes, colors, image_url) VALUES
('Velvet Evening Gown', 'velvet-evening-gown', 'A stunning velvet gown with gold embroidery details, perfect for special occasions.', 450.00, 599.00, (SELECT id FROM public.categories WHERE slug = 'dresses'), true, ARRAY['XS','S','M','L'], ARRAY['Black','Burgundy'], ''),
('Silk Wrap Dress', 'silk-wrap-dress', 'Luxurious silk wrap dress in a timeless silhouette.', 320.00, NULL, (SELECT id FROM public.categories WHERE slug = 'dresses'), true, ARRAY['S','M','L','XL'], ARRAY['Gold','Ivory'], ''),
('Leather Crossbody Bag', 'leather-crossbody-bag', 'Hand-crafted Italian leather crossbody with gold hardware.', 195.00, 250.00, (SELECT id FROM public.categories WHERE slug = 'accessories'), true, ARRAY[]::text[], ARRAY['Walnut','Black'], ''),
('Cashmere Overcoat', 'cashmere-overcoat', 'Premium cashmere blend overcoat with satin lining.', 680.00, NULL, (SELECT id FROM public.categories WHERE slug = 'outerwear'), true, ARRAY['S','M','L'], ARRAY['Charcoal','Camel'], ''),
('Stiletto Ankle Boots', 'stiletto-ankle-boots', 'Pointed-toe ankle boots in buttery soft leather.', 275.00, 350.00, (SELECT id FROM public.categories WHERE slug = 'shoes'), true, ARRAY['36','37','38','39','40'], ARRAY['Black','Walnut'], ''),
('Gold Chain Necklace', 'gold-chain-necklace', 'Delicate layered gold chain necklace with pendant detail.', 145.00, NULL, (SELECT id FROM public.categories WHERE slug = 'accessories'), true, ARRAY[]::text[], ARRAY['Gold'], '');
