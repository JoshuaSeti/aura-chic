ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS color_images JSONB NOT NULL DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly viewable" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
);