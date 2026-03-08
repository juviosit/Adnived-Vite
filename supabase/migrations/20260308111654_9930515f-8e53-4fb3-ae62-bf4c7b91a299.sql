
CREATE TABLE public.account_closure_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.account_closure_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own closure requests
CREATE POLICY "Users can create own closure request"
  ON public.account_closure_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own closure requests
CREATE POLICY "Users can view own closure requests"
  ON public.account_closure_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all closure requests
CREATE POLICY "Admins can view all closure requests"
  ON public.account_closure_requests
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update closure requests
CREATE POLICY "Admins can update closure requests"
  ON public.account_closure_requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete closure requests
CREATE POLICY "Admins can delete closure requests"
  ON public.account_closure_requests
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_account_closure_requests_updated_at
  BEFORE UPDATE ON public.account_closure_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
