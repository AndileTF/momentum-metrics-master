-- Create storage bucket for agent avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-avatars', 'agent-avatars', true);

-- Create policies for agent avatar uploads
CREATE POLICY "Anyone can view agent avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agent-avatars');

CREATE POLICY "Admins can upload agent avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agent avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agent avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agent-avatars' AND has_role(auth.uid(), 'admin'::app_role));