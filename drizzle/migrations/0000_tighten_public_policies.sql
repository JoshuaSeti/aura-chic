DROP POLICY IF EXISTS "Discount codes viewable by everyone" ON public.discount_codes;

DROP POLICY IF EXISTS "Auto discounts viewable by everyone" ON public.automatic_discounts;
CREATE POLICY "Active auto discounts viewable by everyone" ON public.automatic_discounts
FOR SELECT TO anon, authenticated
USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
CREATE POLICY "Public site settings viewable by everyone" ON public.site_settings
FOR SELECT TO anon, authenticated
USING (key IN ('hero','terms_and_conditions','privacy_policy','shipping_policy','return_policy','returns_policy','booking_policy','trading_hours'));

DROP POLICY IF EXISTS "Services viewable by everyone" ON public.services;
CREATE POLICY "Active services viewable by everyone" ON public.services
FOR SELECT TO anon, authenticated
USING (active = true);

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.service_bookings;
CREATE POLICY "Anyone can request a pending booking" ON public.service_bookings
FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND booking_date >= current_date
  AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_id AND s.active = true));

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;