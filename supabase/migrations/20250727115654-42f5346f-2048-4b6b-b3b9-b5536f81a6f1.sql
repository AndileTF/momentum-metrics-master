-- Enable Row Level Security on all tables
ALTER TABLE public.csr_agent_proflie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'agent');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for csr_agent_proflie table
CREATE POLICY "Agents can view their own profile"
ON public.csr_agent_proflie
FOR SELECT
USING (
  agentid IN (
    SELECT agentid FROM public.profile WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can view all profiles"
ON public.csr_agent_proflie
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Only admins can modify profiles"
ON public.csr_agent_proflie
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for daily_stats table
CREATE POLICY "Agents can view their own stats"
ON public.daily_stats
FOR SELECT
USING (
  agentid IN (
    SELECT agentid FROM public.profile WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Admins and managers can view all stats"
ON public.daily_stats
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Only admins can insert stats"
ON public.daily_stats
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update stats"
ON public.daily_stats
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete stats"
ON public.daily_stats
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profile table
CREATE POLICY "Agents can view their own profile data"
ON public.profile
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins and managers can view all profiles"
ON public.profile
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Only admins can modify profile data"
ON public.profile
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default admin user (you'll need to create this user first)
-- This is commented out - create your admin user through auth first, then run this
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('your-admin-user-id-here', 'admin');