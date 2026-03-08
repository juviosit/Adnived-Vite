
-- Function: when a user gets admin role, auto-assign highest plan and mark plan_selected
CREATE OR REPLACE FUNCTION public.handle_admin_role_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  highest_plan_id uuid;
BEGIN
  IF NEW.role = 'admin' THEN
    -- Find the highest-priced active plan
    SELECT id INTO highest_plan_id
    FROM public.plans
    WHERE is_active = true
    ORDER BY price_cents DESC
    LIMIT 1;

    IF highest_plan_id IS NOT NULL THEN
      -- Update existing subscription to highest plan
      UPDATE public.user_subscriptions
      SET plan_id = highest_plan_id, updated_at = now()
      WHERE user_id = NEW.user_id;

      -- If no subscription exists, create one
      IF NOT FOUND THEN
        INSERT INTO public.user_subscriptions (user_id, plan_id)
        VALUES (NEW.user_id, highest_plan_id);
      END IF;
    END IF;

    -- Mark plan as selected so they skip the plan selection page
    UPDATE public.profiles
    SET plan_selected = true, updated_at = now()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: fires when admin role is inserted
CREATE TRIGGER on_admin_role_assigned
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_admin_role_assigned();
