-- =====================================================
-- GOALS SYSTEM MIGRATION
-- Adds comprehensive goal tracking with AI-powered insights
-- =====================================================

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('health', 'career', 'financial', 'personal', 'learning', 'relationships', 'other')),
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Quantifiable metrics
    is_measurable BOOLEAN DEFAULT false,
    current_value NUMERIC,
    target_value NUMERIC,
    unit TEXT, -- e.g., 'kg', 'hours', 'dollars', 'books', etc.
    
    -- AI insights
    ai_assessment JSONB DEFAULT '{}', -- Stores AI-generated progress assessments
    last_assessment_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create goal milestones table
CREATE TABLE IF NOT EXISTS public.goal_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create goal progress logs table
CREATE TABLE IF NOT EXISTS public.goal_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    note TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create goal-habit connections table
CREATE TABLE IF NOT EXISTS public.goal_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    contribution_weight NUMERIC DEFAULT 1.0, -- How much this habit contributes to the goal
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(goal_id, habit_id)
);

-- Add RLS policies for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- Add RLS policies for goal_milestones
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their goals"
    ON public.goal_milestones FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_milestones.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert milestones for their goals"
    ON public.goal_milestones FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_milestones.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can update milestones for their goals"
    ON public.goal_milestones FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_milestones.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete milestones for their goals"
    ON public.goal_milestones FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_milestones.goal_id
        AND goals.user_id = auth.uid()
    ));

-- Add RLS policies for goal_progress_logs
ALTER TABLE public.goal_progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view progress logs for their goals"
    ON public.goal_progress_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_progress_logs.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert progress logs for their goals"
    ON public.goal_progress_logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_progress_logs.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can update progress logs for their goals"
    ON public.goal_progress_logs FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_progress_logs.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete progress logs for their goals"
    ON public.goal_progress_logs FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_progress_logs.goal_id
        AND goals.user_id = auth.uid()
    ));

-- Add RLS policies for goal_habits
ALTER TABLE public.goal_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view habit connections for their goals"
    ON public.goal_habits FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_habits.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert habit connections for their goals"
    ON public.goal_habits FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_habits.goal_id
        AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete habit connections for their goals"
    ON public.goal_habits FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.goals
        WHERE goals.id = goal_habits.goal_id
        AND goals.user_id = auth.uid()
    ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(user_id, category);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_logs_goal_id ON public.goal_progress_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_logs_logged_at ON public.goal_progress_logs(goal_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_habits_goal_id ON public.goal_habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_habits_habit_id ON public.goal_habits(habit_id);

-- Create triggers for updated_at
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_milestones_updated_at
    BEFORE UPDATE ON public.goal_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add goal preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS goal_email_insights_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS goal_assessment_frequency TEXT DEFAULT 'weekly' CHECK (goal_assessment_frequency IN ('daily', 'weekly', 'biweekly', 'monthly'));

COMMENT ON COLUMN public.profiles.goal_email_insights_enabled IS 'Whether to include goal progress insights in emails';
COMMENT ON COLUMN public.profiles.goal_assessment_frequency IS 'How often to run AI assessments on goals';
