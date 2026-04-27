DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Product images are publicly viewable'
  ) THEN
    CREATE POLICY "Product images are publicly viewable"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload product images'
  ) THEN
    CREATE POLICY "Admins can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'product-images'
      AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update product images'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete product images'
  ) THEN
    CREATE POLICY "Admins can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'product-images'
      AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
    );
  END IF;
END $$;