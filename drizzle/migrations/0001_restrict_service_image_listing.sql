DROP POLICY IF EXISTS "Anyone can view service images" ON storage.objects;
CREATE POLICY "Admins can view service images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'service-images' AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role)));