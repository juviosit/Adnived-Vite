-- Remove the insecure INSERT policy that allows any user to self-assign paid plans
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.user_subscriptions;

-- Recreate with admin-only access
CREATE POLICY "Admins can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));