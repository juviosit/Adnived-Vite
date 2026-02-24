
-- Add region, city, and device_type columns to pageviews
ALTER TABLE public.pageviews ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.pageviews ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.pageviews ADD COLUMN IF NOT EXISTS device_type text;
