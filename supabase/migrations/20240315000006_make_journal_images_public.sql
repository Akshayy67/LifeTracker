-- =====================================================
-- Life Tracker - Make Journal Images Bucket Public
-- Migration: 20240315000006
-- Description: Update journal-images bucket to be public for easier access
-- =====================================================

-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'journal-images';

-- Update storage policies to allow public access for viewing
DROP POLICY IF EXISTS "Users can view own journal images" ON storage.objects;

CREATE POLICY "Anyone can view journal images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'journal-images'
    );

-- Comment on the change
COMMENT ON STORAGE BUCKET journal-images IS 
    'Public bucket for journal images - images are accessible via public URLs but controlled by RLS policies at database level';
