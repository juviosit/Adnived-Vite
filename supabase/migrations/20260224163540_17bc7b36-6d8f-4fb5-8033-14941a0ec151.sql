
-- Allow admins to view all profiles (needed for admin users page)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all sites (needed for admin sites page)
CREATE POLICY "Admins can view all sites"
  ON public.sites FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any site
CREATE POLICY "Admins can delete any site"
  ON public.sites FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
