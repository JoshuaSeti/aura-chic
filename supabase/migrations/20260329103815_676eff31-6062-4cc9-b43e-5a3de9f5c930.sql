
-- Add availability columns to services
ALTER TABLE public.services
  ADD COLUMN available_days text[] DEFAULT '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}'::text[],
  ADD COLUMN available_start_time time DEFAULT '09:00',
  ADD COLUMN available_end_time time DEFAULT '17:00',
  ADD COLUMN is_limited_time boolean DEFAULT false,
  ADD COLUMN limited_time_start timestamptz DEFAULT NULL,
  ADD COLUMN limited_time_end timestamptz DEFAULT NULL;

-- Add super_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
