-- =====================================================
-- STRICT HABIT VERIFICATION SYSTEM
-- Adds photo verification for habits with AI validation
-- =====================================================

-- Add strict mode column to habits
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS strict_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_prompt TEXT;

COMMENT ON COLUMN public.habits.strict_mode IS 'Requires photo verification before marking complete';
COMMENT ON COLUMN public.habits.verification_prompt IS 'AI prompt describing what the photo should show';

-- Create habit verification photos table
CREATE TABLE IF NOT EXISTS public.habit_verification_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_completion_id UUID NOT NULL REFERENCES public.habit_completions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    ai_verification_result JSONB,
    verified BOOLEAN DEFAULT false,
    verification_score NUMERIC,
    verification_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.habit_verification_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification photos"
    ON public.habit_verification_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification photos"
    ON public.habit_verification_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification photos"
    ON public.habit_verification_photos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification photos"
    ON public.habit_verification_photos FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_habit_verification_photos_completion 
    ON public.habit_verification_photos(habit_completion_id);
CREATE INDEX IF NOT EXISTS idx_habit_verification_photos_user 
    ON public.habit_verification_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_verification_photos_verified 
    ON public.habit_verification_photos(user_id, verified);

-- Create trigger for updated_at
CREATE TRIGGER update_habit_verification_photos_updated_at
    BEFORE UPDATE ON public.habit_verification_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for verification photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('habit-verifications', 'habit-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification photos
CREATE POLICY "Users can upload their verification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'habit-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their verification photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'habit-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their verification photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'habit-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to generate verification photo path
CREATE OR REPLACE FUNCTION generate_verification_photo_path(
    p_user_id UUID,
    p_habit_id UUID,
    p_file_name TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN p_user_id::text || '/' || p_habit_id::text || '/' || 
           EXTRACT(EPOCH FROM NOW())::bigint || '_' || p_file_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get verification photo URL
CREATE OR REPLACE FUNCTION get_verification_photo_url(p_storage_path TEXT)
RETURNS TEXT AS $$
DECLARE
    v_url TEXT;
BEGIN
    SELECT 
        CASE 
            WHEN p_storage_path IS NULL THEN NULL
            ELSE (SELECT url FROM storage.objects WHERE name = p_storage_path AND bucket_id = 'habit-verifications')
        END INTO v_url;
    
    RETURN v_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.habit_verification_photos IS 'Stores photo verification for strict mode habits';
COMMENT ON COLUMN public.habit_verification_photos.ai_verification_result IS 'Full AI analysis result in JSON format';
COMMENT ON COLUMN public.habit_verification_photos.verified IS 'Whether AI verified the photo matches the habit';
COMMENT ON COLUMN public.habit_verification_photos.verification_score IS 'Confidence score from AI (0-100)';
COMMENT ON COLUMN public.habit_verification_photos.verification_feedback IS 'AI feedback about the photo';
