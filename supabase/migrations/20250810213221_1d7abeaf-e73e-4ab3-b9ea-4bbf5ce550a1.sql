-- Harden SECURITY DEFINER functions by setting an empty search_path and schema-qualifying references
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role FROM public.users WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_headmaster(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role IN ('admin', 'headmaster') FROM public.users WHERE id = user_id;
$function$;

-- Tighten Storage policies for avatar buckets
-- Drop existing policies with the same names if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read for avatar buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to avatar buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update avatar buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from avatar buckets" ON storage.objects;

-- Public read for avatar buckets
CREATE POLICY "Public read for avatar buckets"
ON storage.objects
FOR SELECT
USING (bucket_id IN ('agent-avatars','public-avatars'));

-- Only admins can insert (upload) to avatar buckets
CREATE POLICY "Admins can upload to avatar buckets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id IN ('agent-avatars','public-avatars')
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can update objects in avatar buckets
CREATE POLICY "Admins can update avatar buckets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id IN ('agent-avatars','public-avatars')
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id IN ('agent-avatars','public-avatars')
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete objects in avatar buckets
CREATE POLICY "Admins can delete from avatar buckets"
ON storage.objects
FOR DELETE
USING (
  bucket_id IN ('agent-avatars','public-avatars')
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
