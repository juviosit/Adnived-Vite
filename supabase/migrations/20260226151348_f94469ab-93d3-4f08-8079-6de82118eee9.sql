
-- Payment gateway settings (singleton table for OnePay config)
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'onepay',
  app_id text NOT NULL DEFAULT '',
  app_token text NOT NULL DEFAULT '',
  hash_salt text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'LKR',
  is_test_mode boolean NOT NULL DEFAULT true,
  redirect_url text NOT NULL DEFAULT '',
  callback_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one row allowed
CREATE UNIQUE INDEX payment_settings_singleton ON public.payment_settings ((true));

-- RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment settings"
  ON public.payment_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert payment settings"
  ON public.payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row
INSERT INTO public.payment_settings (provider) VALUES ('onepay');

-- Payment transactions log
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.plans(id) NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'LKR',
  status text NOT NULL DEFAULT 'pending',
  onepay_transaction_id text,
  order_reference text NOT NULL,
  additional_data text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own transactions"
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update transactions"
  ON public.payment_transactions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
