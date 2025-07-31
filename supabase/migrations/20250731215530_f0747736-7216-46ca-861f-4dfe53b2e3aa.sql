-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for agent-avatars bucket to start fresh
DROP POLICY IF EXISTS "Anyone can view agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Manager upload agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Manager update agent avatars" ON storage.objects;

-- Create comprehensive policies for agent-avatars bucket
-- Allow anyone to view agent avatars (for public access)
CREATE POLICY "Public read access to agent avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agent-avatars');

-- Allow authenticated users with admin or manager role to insert/upload
CREATE POLICY "Authenticated upload to agent avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'agent-avatars' 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

-- Allow authenticated users with admin or manager role to update
CREATE POLICY "Authenticated update agent avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'agent-avatars' 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

-- Allow authenticated users with admin role to delete
CREATE POLICY "Admin delete agent avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'agent-avatars' 
  AND auth.role() = 'authenticated'
  AND has_role(auth.uid(), 'admin'::app_role)
);