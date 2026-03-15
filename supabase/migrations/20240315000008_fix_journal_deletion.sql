-- =====================================================
-- Life Tracker - Fix Journal Deletion Issues
-- Migration: 20240315000008
-- Description: Comprehensive fix for journal entry and image deletion
-- =====================================================

-- Drop problematic triggers
DROP TRIGGER IF EXISTS on_journal_entry_deleted ON journal_entries;
DROP TRIGGER IF EXISTS on_journal_image_deleted ON journal_images;
DROP FUNCTION IF EXISTS delete_journal_entry_images();
DROP FUNCTION IF EXISTS delete_journal_image_storage();

-- Update storage policies for public bucket
DROP POLICY IF EXISTS "Users can view own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own journal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own journal images" ON storage.objects;

-- Create new simplified policies for public bucket
CREATE POLICY "Users can upload own journal images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view journal images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'journal-images'
    );

CREATE POLICY "Users can delete own journal images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'journal-images';
