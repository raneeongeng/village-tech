-- Storage bucket and policies for document uploads

-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to their tenant folder
CREATE POLICY "Users can upload files to their tenant folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = get_current_tenant_id()::text
);

-- Policy to allow users to view files from their tenant folder
CREATE POLICY "Users can view files from their tenant folder" ON storage.objects
FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = get_current_tenant_id()::text
);

-- Policy to allow users to update files in their tenant folder
CREATE POLICY "Users can update files in their tenant folder" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = get_current_tenant_id()::text
);

-- Policy to allow users to delete files from their tenant folder
CREATE POLICY "Users can delete files from their tenant folder" ON storage.objects
FOR DELETE USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = get_current_tenant_id()::text
);