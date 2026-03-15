-- =====================================================
-- AI LIFE REVIEW SYSTEM
-- Stores AI-generated life reviews from journal entries
-- =====================================================

-- Create AI reviews table
CREATE TABLE IF NOT EXISTS public.ai_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journal_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    review_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI reviews"
    ON public.ai_reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI reviews"
    ON public.ai_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI reviews"
    ON public.ai_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI reviews"
    ON public.ai_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_reviews_user 
    ON public.ai_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_journal 
    ON public.ai_reviews(journal_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_created 
    ON public.ai_reviews(user_id, created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_reviews_updated_at
    BEFORE UPDATE ON public.ai_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add AI review preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_review_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ultimate_goal TEXT,
ADD COLUMN IF NOT EXISTS weekly_goal TEXT;

COMMENT ON TABLE public.ai_reviews IS 'Stores AI-generated life reviews based on journal entries';
COMMENT ON COLUMN public.ai_reviews.review_text IS 'Full AI-generated review text';
COMMENT ON COLUMN public.ai_reviews.review_data IS 'Structured review data in JSON format';
COMMENT ON COLUMN public.profiles.ultimate_goal IS 'User ultimate life goal';
COMMENT ON COLUMN public.profiles.weekly_goal IS 'User weekly goal';
