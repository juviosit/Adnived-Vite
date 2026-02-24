
-- Enums
CREATE TYPE public.site_member_role AS ENUM ('viewer', 'admin');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- Sites
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  public_share BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Site members (must exist before can_access_site function)
CREATE TABLE public.site_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role site_member_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, user_id)
);
ALTER TABLE public.site_members ENABLE ROW LEVEL SECURITY;

-- Helper functions (after all tables exist)
CREATE OR REPLACE FUNCTION public.is_site_owner(_site_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.sites WHERE id = _site_id AND user_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.can_access_site(_site_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sites WHERE id = _site_id AND user_id = auth.uid()
    UNION ALL
    SELECT 1 FROM public.site_members WHERE site_id = _site_id AND user_id = auth.uid()
  )
$$;

-- Sites RLS
CREATE POLICY "Users can view own or member sites" ON public.sites FOR SELECT USING (public.can_access_site(id));
CREATE POLICY "Users can create sites" ON public.sites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can update sites" ON public.sites FOR UPDATE USING (public.is_site_owner(id));
CREATE POLICY "Owners can delete sites" ON public.sites FOR DELETE USING (public.is_site_owner(id));

-- Site members RLS
CREATE POLICY "Owners and members can view memberships" ON public.site_members FOR SELECT USING (public.is_site_owner(site_id) OR user_id = auth.uid());
CREATE POLICY "Owners can add members" ON public.site_members FOR INSERT WITH CHECK (public.is_site_owner(site_id) AND user_id != auth.uid());
CREATE POLICY "Owners can update members" ON public.site_members FOR UPDATE USING (public.is_site_owner(site_id));
CREATE POLICY "Owners can remove, members can leave" ON public.site_members FOR DELETE USING (public.is_site_owner(site_id) OR user_id = auth.uid());

-- Pageviews
CREATE TABLE public.pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  pathname TEXT NOT NULL DEFAULT '/',
  referrer TEXT, country TEXT, browser TEXT, os TEXT, screen_size TEXT, session_hash TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site access can view pageviews" ON public.pageviews FOR SELECT USING (public.can_access_site(site_id));

-- Custom events
CREATE TABLE public.custom_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site access can view events" ON public.custom_events FOR SELECT USING (public.can_access_site(site_id));

-- Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('pageview', 'event')),
  goal_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site access can view goals" ON public.goals FOR SELECT USING (public.can_access_site(site_id));
CREATE POLICY "Site access can create goals" ON public.goals FOR INSERT WITH CHECK (public.can_access_site(site_id));
CREATE POLICY "Owners can update goals" ON public.goals FOR UPDATE USING (public.is_site_owner(site_id));
CREATE POLICY "Owners can delete goals" ON public.goals FOR DELETE USING (public.is_site_owner(site_id));

-- Funnels
CREATE TABLE public.funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site access can view funnels" ON public.funnels FOR SELECT USING (public.can_access_site(site_id));
CREATE POLICY "Site access can create funnels" ON public.funnels FOR INSERT WITH CHECK (public.can_access_site(site_id));
CREATE POLICY "Owners can update funnels" ON public.funnels FOR UPDATE USING (public.is_site_owner(site_id));
CREATE POLICY "Owners can delete funnels" ON public.funnels FOR DELETE USING (public.is_site_owner(site_id));

-- Funnel steps
CREATE TABLE public.funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  step_order INT NOT NULL, name TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('pageview', 'event')),
  goal_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_funnel_site_id(_funnel_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT site_id FROM public.funnels WHERE id = _funnel_id $$;

CREATE POLICY "Access funnel steps" ON public.funnel_steps FOR SELECT USING (public.can_access_site(public.get_funnel_site_id(funnel_id)));
CREATE POLICY "Create funnel steps" ON public.funnel_steps FOR INSERT WITH CHECK (public.can_access_site(public.get_funnel_site_id(funnel_id)));
CREATE POLICY "Update funnel steps" ON public.funnel_steps FOR UPDATE USING (public.is_site_owner(public.get_funnel_site_id(funnel_id)));
CREATE POLICY "Delete funnel steps" ON public.funnel_steps FOR DELETE USING (public.is_site_owner(public.get_funnel_site_id(funnel_id)));

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_pageviews_site_timestamp ON public.pageviews(site_id, timestamp DESC);
CREATE INDEX idx_pageviews_session_hash ON public.pageviews(session_hash);
CREATE INDEX idx_custom_events_site_timestamp ON public.custom_events(site_id, timestamp DESC);
CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_site_members_user_id ON public.site_members(user_id);
CREATE INDEX idx_site_members_site_id ON public.site_members(site_id);
