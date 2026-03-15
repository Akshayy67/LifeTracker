# Quick Email Setup Checklist

## ✅ Step-by-Step Setup

### 1. Add Environment Variables to `.env.local`

Create/edit `c:\Users\Akshay\Projects\Life Tracker\.env.local` and add:

```env
# Email Service
RESEND_API_KEY=re_fDjS9rYf_DapXeRpUJVB9XiVL9EqnpcgA
EMAIL_FROM=onboarding@resend.dev

# AI Service
GEMINI_API_KEY=AIzaSyAYKuTyxZH3uN-M44BwO_Mw_Euxsggk_iI

# App URL (for local testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/ponifijcqsvrxfpphzbe/sql
2. Copy and paste this SQL:

```sql
-- First migration: Add background_image column
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Second migration: Add email notification fields
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
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.personal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
    ON public.personal_reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
    ON public.personal_reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON public.personal_reminders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON public.personal_reminders FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_personal_reminders_user_id 
    ON public.personal_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_reminders_active 
    ON public.personal_reminders(user_id, is_active);

CREATE TRIGGER update_personal_reminders_updated_at
    BEFORE UPDATE ON public.personal_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** or press `Ctrl+Enter`

### 3. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Test Email Configuration

1. Open your browser: http://localhost:3000/api/test-email-config
2. You should see:
   ```json
   {
     "status": "ready",
     "config": {
       "resendConfigured": true,
       "emailFrom": "onboarding@resend.dev",
       "geminiConfigured": true,
       "aiService": "Gemini"
     },
     "issues": []
   }
   ```

### 5. Enable Email Notifications in Settings

1. Go to: http://localhost:3000/settings
2. Scroll to **Email Notifications** section
3. Toggle **Enable Email Notifications** ON
4. Configure your preferences:
   - ✅ Morning Motivation Email (set time: 07:00)
   - ✅ End-of-Day Summary Email (set time: 20:00)
   - ✅ Motivational Quotes
   - ✅ AI Personalization
5. Click **Save Email Preferences**

### 6. Send Test Email

In the same Email Notifications section:
1. Click **Test Morning Email** or **Test EOD Email**
2. Wait for success message
3. Check your email inbox (the email address you used to sign up)

## 🔍 Troubleshooting

### Test Email Button is Disabled
- Make sure "Enable Email Notifications" is toggled ON
- Save your preferences first

### "Email notifications not enabled" Error
- This has been fixed - test emails now work regardless of settings
- Restart your dev server if you still see this

### Email Not Received
1. **Check Resend Dashboard**: https://resend.com/emails
   - Look for your email in the logs
   - Check for any errors

2. **Check Browser Console** (F12):
   - Look for error messages when clicking test button
   - Check Network tab for API call details

3. **Check Terminal/Server Logs**:
   - Look for console.log messages showing email sending process
   - Check for any error stack traces

4. **Verify Environment Variables**:
   - Visit: http://localhost:3000/api/test-email-config
   - All should show `true` or proper values

### AI Messages Not Working
- If Gemini fails, the system automatically falls back to template messages
- Check browser console for any AI-related errors
- Template messages are still motivational and work great!

### Wrong Email Address
- The email goes to the address you used to sign up
- Check your profile: http://localhost:3000/settings
- Email field shows your current email

## 📧 What Emails Look Like

### Morning Email Includes:
- Personalized AI greeting
- Motivational quote
- Your personal reminders for today
- 1% improvement tracker
- Call-to-action button to start your day

### EOD Email Includes:
- AI-powered encouragement based on your day
- Habit completion stats (X/Y completed, percentage)
- Journal entries count
- Expense tracking summary
- Active streak celebrations
- Tomorrow's reminders
- Motivational quote
- 1% improvement progress

## 🚀 Next Steps

Once testing works locally:

1. **Deploy to Vercel** (for automated daily emails)
2. **Add environment variables** in Vercel dashboard
3. **Cron jobs will automatically run** at 7 AM and 8 PM UTC
4. **Emails sent based on your timezone** setting in profile

## 💡 Tips

- **Use real data**: Create some habits, track completions, write journal entries to see rich email content
- **Test both email types**: Morning and EOD emails have different content
- **Check spam folder**: First email might land in spam
- **Resend test domain**: `onboarding@resend.dev` works immediately, no domain verification needed

---

**Need help?** Check the full guide: `EMAIL_NOTIFICATIONS_SETUP.md`
