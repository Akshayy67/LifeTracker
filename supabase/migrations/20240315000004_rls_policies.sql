-- =====================================================
-- Life Tracker - Row Level Security Policies
-- Migration: 20240315000004
-- Description: RLS policies for all tables
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but policy needed)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- HABITS POLICIES
-- =====================================================

-- Users can view their own habits
CREATE POLICY "Users can view own habits"
    ON habits FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own habits
CREATE POLICY "Users can create own habits"
    ON habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
CREATE POLICY "Users can update own habits"
    ON habits FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own habits
CREATE POLICY "Users can delete own habits"
    ON habits FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- HABIT_COMPLETIONS POLICIES
-- =====================================================

-- Users can view their own habit completions
CREATE POLICY "Users can view own habit completions"
    ON habit_completions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own habit completions
CREATE POLICY "Users can create own habit completions"
    ON habit_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own habit completions
CREATE POLICY "Users can delete own habit completions"
    ON habit_completions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- JOURNAL_ENTRIES POLICIES
-- =====================================================

-- Users can view their own journal entries
CREATE POLICY "Users can view own journal entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own journal entries
CREATE POLICY "Users can create own journal entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- JOURNAL_IMAGES POLICIES
-- =====================================================

-- Users can view their own journal images
CREATE POLICY "Users can view own journal images"
    ON journal_images FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own journal images
CREATE POLICY "Users can create own journal images"
    ON journal_images FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal images
CREATE POLICY "Users can update own journal images"
    ON journal_images FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own journal images
CREATE POLICY "Users can delete own journal images"
    ON journal_images FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXPENSE_CATEGORIES POLICIES
-- =====================================================

-- Users can view their own expense categories
CREATE POLICY "Users can view own expense categories"
    ON expense_categories FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own expense categories
CREATE POLICY "Users can create own expense categories"
    ON expense_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expense categories
CREATE POLICY "Users can update own expense categories"
    ON expense_categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expense categories (if not default)
CREATE POLICY "Users can delete own expense categories"
    ON expense_categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = false);

-- =====================================================
-- BUDGETS POLICIES
-- =====================================================

-- Users can view their own budgets
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own budgets
CREATE POLICY "Users can create own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================

-- Users can view their own expenses
CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own expenses
CREATE POLICY "Users can create own expenses"
    ON expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses"
    ON expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON habits TO authenticated;
GRANT ALL ON habit_completions TO authenticated;
GRANT ALL ON journal_entries TO authenticated;
GRANT ALL ON journal_images TO authenticated;
GRANT ALL ON expense_categories TO authenticated;
GRANT ALL ON budgets TO authenticated;
GRANT ALL ON expenses TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION calculate_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION monthly_expense_summary(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_habit_completion_rate(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_expenses_by_period(UUID, DATE, DATE) TO authenticated;
