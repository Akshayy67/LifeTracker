-- =====================================================
-- Life Tracker - Fix Journal Delete Trigger
-- Migration: 20240315000007
-- Description: Fix the journal entry delete trigger to properly handle image cleanup
-- =====================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_journal_entry_deleted ON journal_entries;
DROP FUNCTION IF EXISTS delete_journal_entry_images();

-- Create improved function to delete journal entry images
CREATE OR REPLACE FUNCTION delete_journal_entry_images()
RETURNS TRIGGER AS $$
BEGIN
    -- First delete all associated image records from journal_images table
    -- This will cascade to delete storage objects via the other trigger
    DELETE FROM journal_images 
    WHERE journal_entry_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_journal_entry_deleted
    BEFORE DELETE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION delete_journal_entry_images();

-- Comment on the fix
COMMENT ON FUNCTION delete_journal_entry_images IS 
    'Fixed version: Deletes journal_images records first, which cascades to storage cleanup';
