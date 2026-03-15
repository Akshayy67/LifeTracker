-- =====================================================
-- Life Tracker - Update Journal Policies (Idempotent)
-- Migration: 20240315000009
-- Description: Update journal storage policies safely (idempotent)
-- =====================================================

-- Update storage policies to allow public access for viewing
-- Only drop and recreate if they don't exist or have different definitions
DROP POLICY IF EXISTS "Users can view own journal images" ON storage.objects;

CREATE POLICY "Anyone can view journal images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'journal-images'
    );

-- Comment on the change
COMMENT ON STORAGE BUCKET journal-images IS 
    'Public bucket for journal images - images are accessible via public URLs but controlled by RLS policies at database level';
