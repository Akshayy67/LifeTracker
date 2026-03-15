-- Add email notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS morning_email_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS morning_email_time TIME DEFAULT '07:00:00',
ADD COLUMN IF NOT EXISTS eod_email_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS eod_email_time TIME DEFAULT '20:00:00',
ADD COLUMN IF NOT EXISTS motivational_quotes_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_personalization_enabled BOOLEAN DEFAULT true;

-- Create personal reminders table
CREATE TABLE IF NOT EXISTS public.personal_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIME NOT NULL,
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=Sunday, 6=Saturday
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for personal_reminders
ALTER TABLE public.personal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
    ON public.personal_reminders
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
    ON public.personal_reminders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON public.personal_reminders
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON public.personal_reminders
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_personal_reminders_user_id ON public.personal_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_reminders_active ON public.personal_reminders(user_id, is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_personal_reminders_updated_at
    BEFORE UPDATE ON public.personal_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON COLUMN public.profiles.email_notifications_enabled IS 'Master toggle for all email notifications';
COMMENT ON COLUMN public.profiles.morning_email_enabled IS 'Enable morning motivation email';
COMMENT ON COLUMN public.profiles.morning_email_time IS 'Time to send morning email (user timezone)';
COMMENT ON COLUMN public.profiles.eod_email_enabled IS 'Enable end-of-day summary email';
COMMENT ON COLUMN public.profiles.eod_email_time IS 'Time to send EOD email (user timezone)';
COMMENT ON COLUMN public.profiles.motivational_quotes_enabled IS 'Include motivational quotes in emails';
COMMENT ON COLUMN public.profiles.ai_personalization_enabled IS 'Use AI to personalize email content';
COMMENT ON TABLE public.personal_reminders IS 'User-defined personal reminders to include in daily emails';
