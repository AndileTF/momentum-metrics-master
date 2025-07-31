-- Create the most permissive policies possible for public-avatars bucket
-- First, let's try to create policies that allow all operations for anyone on public-avatars

-- Allow anyone to upload to public-avatars bucket (no authentication required)
DO $$
BEGIN
    -- Try to create a policy that allows uploads for anyone to public-avatars
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public uploads to public-avatars'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow public uploads to public-avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''public-avatars'')';
    END IF;
    
    -- Allow anyone to read from public-avatars bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public reads from public-avatars'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow public reads from public-avatars" ON storage.objects FOR SELECT USING (bucket_id = ''public-avatars'')';
    END IF;
    
    -- Allow anyone to update public-avatars bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public updates to public-avatars'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow public updates to public-avatars" ON storage.objects FOR UPDATE USING (bucket_id = ''public-avatars'')';
    END IF;
    
    -- Allow anyone to delete from public-avatars bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public deletes from public-avatars'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow public deletes from public-avatars" ON storage.objects FOR DELETE USING (bucket_id = ''public-avatars'')';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Insufficient privileges to create storage policies';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;