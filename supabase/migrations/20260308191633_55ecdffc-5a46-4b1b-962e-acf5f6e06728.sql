
-- Fix access_requests RLS policies: change from RESTRICTIVE to PERMISSIVE
-- Currently all policies are RESTRICTIVE, meaning ALL must pass for a row to be visible.
-- They should be PERMISSIVE (default) so any ONE matching policy grants access.

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Owners can view requests for their sites" ON public.access_requests;
DROP POLICY IF EXISTS "Requesters can view own requests" ON public.access_requests;
DROP POLICY IF EXISTS "Owners can update requests" ON public.access_requests;
DROP POLICY IF EXISTS "Owners can delete requests" ON public.access_requests;
DROP POLICY IF EXISTS "Requesters can cancel own requests" ON public.access_requests;
DROP POLICY IF EXISTS "Users can create access requests" ON public.access_requests;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins can view all access requests"
  ON public.access_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can view requests for their sites"
  ON public.access_requests FOR SELECT
  TO authenticated
  USING (is_site_owner(site_id));

CREATE POLICY "Requesters can view own requests"
  ON public.access_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Owners can update requests"
  ON public.access_requests FOR UPDATE
  TO authenticated
  USING (is_site_owner(site_id));

CREATE POLICY "Owners can delete requests"
  ON public.access_requests FOR DELETE
  TO authenticated
  USING (is_site_owner(site_id));

CREATE POLICY "Requesters can cancel own requests"
  ON public.access_requests FOR DELETE
  TO authenticated
  USING (requester_id = auth.uid() AND status = 'pending');

CREATE POLICY "Users can create access requests"
  ON public.access_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());
