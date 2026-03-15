-- =====================================================
-- Life Tracker - Initial Database Schema
-- Migration: 20240315000001
-- Description: Core tables, indexes, and constraints
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- =====================================================
-- HABITS TABLE
-- =====================================================
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'circle',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT habits_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indexes for habits
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(user_id, active) WHERE active = true;
CREATE INDEX idx_habits_created_at ON habits(created_at DESC);
CREATE INDEX idx_habits_frequency ON habits(frequency);

-- =====================================================
-- HABIT_COMPLETIONS TABLE
-- =====================================================
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate completions for the same habit on the same date
    CONSTRAINT unique_habit_completion_per_day UNIQUE (habit_id, completion_date)
);

-- Indexes for habit_completions
CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date DESC);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at DESC);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date DESC);

-- =====================================================
-- JOURNAL_ENTRIES TABLE
-- =====================================================
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT journal_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for journal_entries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX idx_journal_entries_favorite ON journal_entries(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- =====================================================
-- JOURNAL_IMAGES TABLE
-- =====================================================
CREATE TABLE journal_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_storage_path UNIQUE (storage_path)
);

-- Indexes for journal_images
CREATE INDEX idx_journal_images_entry_id ON journal_images(journal_entry_id);
CREATE INDEX idx_journal_images_user_id ON journal_images(user_id);
CREATE INDEX idx_journal_images_created_at ON journal_images(created_at DESC);
CREATE INDEX idx_journal_images_display_order ON journal_images(journal_entry_id, display_order);

-- =====================================================
-- EXPENSE_CATEGORIES TABLE
-- =====================================================
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'dollar-sign',
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT expense_categories_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name)
);

-- Indexes for expense_categories
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX idx_expense_categories_default ON expense_categories(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_expense_categories_display_order ON expense_categories(user_id, display_order);

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_active ON budgets(user_id, active) WHERE active = true;
CREATE INDEX idx_budgets_date_range ON budgets(start_date, end_date);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'other')),
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX idx_expenses_amount ON expenses(amount DESC);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
    BEFORE UPDATE ON expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
