
-- Allow admins to view all pageviews
CREATE POLICY "Admins can view all pageviews"
ON public.pageviews FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all custom events
CREATE POLICY "Admins can view all custom events"
ON public.custom_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all funnels
CREATE POLICY "Admins can view all funnels"
ON public.funnels FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all funnel steps
CREATE POLICY "Admins can view all funnel steps"
ON public.funnel_steps FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all goals
CREATE POLICY "Admins can view all goals"
ON public.goals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all access requests
CREATE POLICY "Admins can view all access requests"
ON public.access_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all site members
CREATE POLICY "Admins can view all site members"
ON public.site_members FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
