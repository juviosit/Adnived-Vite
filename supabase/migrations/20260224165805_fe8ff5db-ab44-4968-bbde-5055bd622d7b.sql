
-- Add unique constraint on domain
ALTER TABLE public.sites ADD CONSTRAINT sites_domain_unique UNIQUE (domain);

-- Create access requests table
CREATE TABLE public.access_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (site_id, requester_id)
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Requesters can view their own requests
CREATE POLICY "Requesters can view own requests"
ON public.access_requests FOR SELECT
USING (requester_id = auth.uid());

-- Site owners can view requests for their sites
CREATE POLICY "Owners can view requests for their sites"
ON public.access_requests FOR SELECT
USING (is_site_owner(site_id));

-- Anyone authenticated can create a request
CREATE POLICY "Users can create access requests"
ON public.access_requests FOR INSERT
WITH CHECK (requester_id = auth.uid());

-- Owners can update request status (approve/deny)
CREATE POLICY "Owners can update requests"
ON public.access_requests FOR UPDATE
USING (is_site_owner(site_id));

-- Owners can delete requests
CREATE POLICY "Owners can delete requests"
ON public.access_requests FOR DELETE
USING (is_site_owner(site_id));

-- Requesters can delete their own pending requests
CREATE POLICY "Requesters can cancel own requests"
ON public.access_requests FOR DELETE
USING (requester_id = auth.uid() AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
