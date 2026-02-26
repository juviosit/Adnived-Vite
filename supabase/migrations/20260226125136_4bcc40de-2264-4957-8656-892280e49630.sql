ALTER TABLE public.pageviews 
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text;

-- RLS policy for public shared dashboards: allow anonymous SELECT on pageviews when site's public_share is true
CREATE POLICY "Public can view shared site pageviews"
  ON public.pageviews FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.sites 
      WHERE sites.id = pageviews.site_id 
      AND sites.public_share = true
    )
  );

-- Allow anon to read sites that are publicly shared
CREATE POLICY "Public can view shared sites"
  ON public.sites FOR SELECT
  TO anon
  USING (public_share = true);

-- Allow anon to read custom_events for shared sites
CREATE POLICY "Public can view shared site events"
  ON public.custom_events FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.sites 
      WHERE sites.id = custom_events.site_id 
      AND sites.public_share = true
    )
  );