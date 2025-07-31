-- Fix storage policies for agent avatars - make them more permissive for admins
DROP POLICY IF EXISTS "Admins can upload agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete agent avatars" ON storage.objects;

-- Create more permissive policies for admin uploads
CREATE POLICY "Admin full access to agent avatars" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'admin'::app_role));

-- Also allow managers to upload avatars
CREATE POLICY "Manager upload agent avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Manager update agent avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'manager'::app_role));

-- Ensure the bucket is public for read access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'agent-avatars';