-- Drop the overly permissive profiles INSERT policy (profiles are created by handle_new_user trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;