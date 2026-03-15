-- =====================================================
-- Life Tracker - Storage Configuration
-- Migration: 20240315000005
-- Description: Storage buckets and policies for journal images
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Insert storage bucket for journal images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'journal-images',
    'journal-images',
    true, -- Public bucket for easier access
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload own journal images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Anyone can view journal images (public bucket)
CREATE POLICY "Anyone can view journal images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'journal-images'
    );

-- Policy: Users can update their own images
CREATE POLICY "Users can update own journal images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own journal images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'journal-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- STORAGE HELPER FUNCTIONS
-- =====================================================

-- Function to generate storage path for journal images
CREATE OR REPLACE FUNCTION generate_journal_image_path(
    p_user_id UUID,
    p_journal_entry_id UUID,
    p_file_name TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- Path structure: user_id/journal_entry_id/timestamp_filename
    RETURN p_user_id::text || '/' || 
           p_journal_entry_id::text || '/' || 
           EXTRACT(EPOCH FROM NOW())::bigint::text || '_' || 
           p_file_name;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get public URL for journal image
CREATE OR REPLACE FUNCTION get_journal_image_url(p_storage_path TEXT)
RETURNS TEXT AS $$
DECLARE
    v_base_url TEXT;
BEGIN
    -- Get the Supabase project URL from settings
    -- This should be replaced with actual project URL in production
    v_base_url := current_setting('app.settings.supabase_url', true);
    
    IF v_base_url IS NULL THEN
        -- Fallback for local development
        v_base_url := 'http://localhost:54321';
    END IF;
    
    RETURN v_base_url || '/storage/v1/object/authenticated/journal-images/' || p_storage_path;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- STORAGE CLEANUP TRIGGER
-- =====================================================

-- Function to delete storage objects when journal images are deleted
CREATE OR REPLACE FUNCTION delete_journal_image_storage()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the file from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'journal-images'
    AND name = OLD.storage_path;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up storage when journal_images record is deleted
DROP TRIGGER IF EXISTS on_journal_image_deleted ON journal_images;
CREATE TRIGGER on_journal_image_deleted
    AFTER DELETE ON journal_images
    FOR EACH ROW
    EXECUTE FUNCTION delete_journal_image_storage();

-- Function to delete all storage objects when journal entry is deleted
CREATE OR REPLACE FUNCTION delete_journal_entry_images()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all associated images from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'journal-images'
    AND name LIKE OLD.user_id::text || '/' || OLD.id::text || '/%';
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up all images when journal entry is deleted
DROP TRIGGER IF EXISTS on_journal_entry_deleted ON journal_entries;
CREATE TRIGGER on_journal_entry_deleted
    BEFORE DELETE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION delete_journal_entry_images();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION generate_journal_image_path IS 
    'Generates a unique storage path for journal images following the pattern: user_id/journal_entry_id/timestamp_filename';

COMMENT ON FUNCTION get_journal_image_url IS 
    'Returns the full authenticated URL for accessing a journal image from storage';

COMMENT ON FUNCTION delete_journal_image_storage IS 
    'Automatically deletes the storage object when a journal_images record is deleted';

COMMENT ON FUNCTION delete_journal_entry_images IS 
    'Automatically deletes all associated storage objects when a journal_entry is deleted';
