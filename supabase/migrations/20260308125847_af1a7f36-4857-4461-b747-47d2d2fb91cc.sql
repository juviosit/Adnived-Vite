
-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referral_email text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  reward_applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert own referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function: when a new profile is created, check for matching referral
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ref_record RECORD;
  pro_plan_id uuid;
BEGIN
  -- Find a pending, non-expired referral matching this email
  SELECT * INTO ref_record
  FROM public.referrals
  WHERE referral_email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF ref_record.id IS NOT NULL THEN
    -- Mark referral as completed
    UPDATE public.referrals
    SET referred_user_id = NEW.id,
        status = 'completed',
        completed_at = now()
    WHERE id = ref_record.id;

    -- Find Pro plan
    SELECT id INTO pro_plan_id
    FROM public.plans
    WHERE slug = 'pro' AND is_active = true
    LIMIT 1;

    IF pro_plan_id IS NOT NULL THEN
      -- Reward referrer: extend or upgrade to Pro
      UPDATE public.user_subscriptions
      SET plan_id = pro_plan_id,
          current_period_end = GREATEST(current_period_end, now()) + interval '30 days',
          updated_at = now()
      WHERE user_id = ref_record.referrer_id;

      -- Reward referred user: set to Pro for 30 days
      UPDATE public.user_subscriptions
      SET plan_id = pro_plan_id,
          current_period_end = now() + interval '30 days',
          updated_at = now()
      WHERE user_id = NEW.id;

      -- Mark reward applied
      UPDATE public.referrals
      SET reward_applied = true
      WHERE id = ref_record.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table
CREATE TRIGGER on_referral_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_signup();
