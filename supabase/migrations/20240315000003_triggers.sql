-- =====================================================
-- Life Tracker - Trigger Functions
-- Migration: 20240315000003
-- Description: Triggers for auto-creating profiles and seeding data
-- =====================================================

-- =====================================================
-- FUNCTION: handle_new_user
-- Description: Automatically create profile and seed default data for new users
-- Triggered on: auth.users INSERT
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Seed default expense categories
    INSERT INTO public.expense_categories (user_id, name, color, icon, is_default, display_order)
    VALUES
        (NEW.id, 'Food & Dining', '#ef4444', 'utensils', true, 1),
        (NEW.id, 'Transportation', '#3b82f6', 'car', true, 2),
        (NEW.id, 'Shopping', '#8b5cf6', 'shopping-bag', true, 3),
        (NEW.id, 'Entertainment', '#ec4899', 'film', true, 4),
        (NEW.id, 'Bills & Utilities', '#f59e0b', 'receipt', true, 5),
        (NEW.id, 'Healthcare', '#10b981', 'heart-pulse', true, 6),
        (NEW.id, 'Other', '#6b7280', 'more-horizontal', true, 7);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNCTION: handle_profile_update
-- Description: Sync profile updates with auth.users metadata
-- =====================================================
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth.users metadata when profile is updated
    -- This keeps the data in sync
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        to_jsonb(NEW.full_name)
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
    AFTER UPDATE OF full_name ON profiles
    FOR EACH ROW
    WHEN (OLD.full_name IS DISTINCT FROM NEW.full_name)
    EXECUTE FUNCTION handle_profile_update();

-- =====================================================
-- FUNCTION: archive_habit
-- Description: Set archived_at timestamp when habit is deactivated
-- =====================================================
CREATE OR REPLACE FUNCTION archive_habit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = false AND OLD.active = true THEN
        NEW.archived_at = NOW();
    ELSIF NEW.active = true AND OLD.active = false THEN
        NEW.archived_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on habits
DROP TRIGGER IF EXISTS on_habit_archived ON habits;
CREATE TRIGGER on_habit_archived
    BEFORE UPDATE OF active ON habits
    FOR EACH ROW
    EXECUTE FUNCTION archive_habit();

-- =====================================================
-- FUNCTION: validate_habit_completion
-- Description: Ensure habit completion belongs to the same user as the habit
-- =====================================================
CREATE OR REPLACE FUNCTION validate_habit_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_habit_user_id UUID;
BEGIN
    -- Get the user_id from the habit
    SELECT user_id INTO v_habit_user_id
    FROM habits
    WHERE id = NEW.habit_id;
    
    -- Ensure the completion user_id matches the habit user_id
    IF v_habit_user_id IS NULL THEN
        RAISE EXCEPTION 'Habit not found';
    END IF;
    
    IF v_habit_user_id != NEW.user_id THEN
        RAISE EXCEPTION 'Cannot complete a habit that does not belong to you';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on habit_completions
DROP TRIGGER IF EXISTS validate_habit_completion_trigger ON habit_completions;
CREATE TRIGGER validate_habit_completion_trigger
    BEFORE INSERT ON habit_completions
    FOR EACH ROW
    EXECUTE FUNCTION validate_habit_completion();

-- =====================================================
-- FUNCTION: validate_journal_image
-- Description: Ensure journal image belongs to the same user as the journal entry
-- =====================================================
CREATE OR REPLACE FUNCTION validate_journal_image()
RETURNS TRIGGER AS $$
DECLARE
    v_entry_user_id UUID;
BEGIN
    -- Get the user_id from the journal entry
    SELECT user_id INTO v_entry_user_id
    FROM journal_entries
    WHERE id = NEW.journal_entry_id;
    
    -- Ensure the image user_id matches the entry user_id
    IF v_entry_user_id IS NULL THEN
        RAISE EXCEPTION 'Journal entry not found';
    END IF;
    
    IF v_entry_user_id != NEW.user_id THEN
        RAISE EXCEPTION 'Cannot add image to a journal entry that does not belong to you';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on journal_images
DROP TRIGGER IF EXISTS validate_journal_image_trigger ON journal_images;
CREATE TRIGGER validate_journal_image_trigger
    BEFORE INSERT ON journal_images
    FOR EACH ROW
    EXECUTE FUNCTION validate_journal_image();

-- =====================================================
-- FUNCTION: validate_expense
-- Description: Ensure expense category belongs to the same user
-- =====================================================
CREATE OR REPLACE FUNCTION validate_expense()
RETURNS TRIGGER AS $$
DECLARE
    v_category_user_id UUID;
BEGIN
    -- Get the user_id from the expense category
    SELECT user_id INTO v_category_user_id
    FROM expense_categories
    WHERE id = NEW.category_id;
    
    -- Ensure the expense user_id matches the category user_id
    IF v_category_user_id IS NULL THEN
        RAISE EXCEPTION 'Expense category not found';
    END IF;
    
    IF v_category_user_id != NEW.user_id THEN
        RAISE EXCEPTION 'Cannot use an expense category that does not belong to you';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on expenses
DROP TRIGGER IF EXISTS validate_expense_trigger ON expenses;
CREATE TRIGGER validate_expense_trigger
    BEFORE INSERT OR UPDATE OF category_id ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION validate_expense();
