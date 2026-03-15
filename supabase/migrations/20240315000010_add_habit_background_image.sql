-- Add background_image column to habits table
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.habits.background_image IS 'URL to background image for the habit card (e.g., from Unsplash)';
