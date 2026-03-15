# Email Notifications Setup Guide

This guide will help you set up automated daily email notifications with motivational messages, progress summaries, and AI-powered personalization.

## Features

✨ **Morning Motivation Emails** - Start your day with:
- AI-generated personalized motivational messages
- Inspirational quotes
- Your personal reminders for the day
- 1% daily improvement tracker
- Yesterday's progress summary

🌙 **End-of-Day Summary Emails** - Review your day with:
- Complete habit completion statistics
- Journal entries count
- Expense tracking summary
- Active streak celebrations
- AI-powered encouraging messages
- Tomorrow's reminders

🤖 **AI Personalization** - Powered by OpenAI or Google Gemini:
- Context-aware messages based on your actual progress
- Adaptive tone (celebrating wins or encouraging on tough days)
- Personalized to your name and habits

## Setup Instructions

### 1. Database Migration

Run the SQL migration to add email notification fields:

```bash
# If using Supabase CLI (after linking project)
npx supabase db push

# OR manually in Supabase Dashboard SQL Editor
# Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
# Run the migration file: supabase/migrations/20240315000011_add_email_notifications.sql
```

### 2. Email Service Setup (Resend)

**Why Resend?** Free tier includes 3,000 emails/month, perfect for personal use.

1. **Create Resend Account**
   - Visit: https://resend.com
   - Sign up for free account

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the key

3. **Verify Domain (Optional but Recommended)**
   - Go to: https://resend.com/domains
   - Add your domain
   - Follow DNS verification steps
   - Use format: `noreply@yourdomain.com`

4. **Add to Environment Variables**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

   For testing, you can use: `EMAIL_FROM=onboarding@resend.dev`

### 3. AI Service Setup (Choose One)

#### Option A: OpenAI (Recommended)

1. **Get API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key

2. **Add to Environment**
   ```env
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx
   ```

3. **Pricing**: ~$0.002 per email (very affordable)

#### Option B: Google Gemini (Free Alternative)

1. **Get API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Copy the key

2. **Add to Environment**
   ```env
   GEMINI_API_KEY=xxxxxxxxxxxxx
   ```

3. **Pricing**: Free tier available

**Note**: If neither AI service is configured, the system will use template-based motivational messages (still great!).

### 4. Cron Job Security

Generate a random secret for securing cron endpoints:

```bash
# Generate a random string (use any method)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:
```env
CRON_SECRET=your_generated_random_string_here
```

### 5. Deploy to Vercel

The cron jobs are configured in `vercel.json`:
- Morning emails: 7:00 AM UTC (runs hourly, checks user timezone)
- EOD emails: 8:00 PM UTC (runs hourly, checks user timezone)

**Deploy Steps**:
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `OPENAI_API_KEY` or `GEMINI_API_KEY`
   - `CRON_SECRET`
   - All existing Supabase variables

4. Deploy!

Vercel will automatically set up the cron jobs.

### 6. Enable in Settings

1. Navigate to `/settings` in your app
2. Scroll to "Email Notifications" section
3. Toggle "Enable Email Notifications"
4. Configure:
   - ✅ Morning Motivation Email (set your preferred time)
   - ✅ End-of-Day Summary Email (set your preferred time)
   - ✅ Motivational Quotes
   - ✅ AI Personalization
5. Click "Save Email Preferences"

## Testing

### Manual Test

Send a test email immediately:

```bash
# Test morning email
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"type":"morning"}'

# Test EOD email
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"type":"eod"}'
```

Or create a test button in your app that calls `/api/send-email`.

### Verify Cron Jobs

Check Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Select latest deployment
4. Click "Functions" tab
5. Look for cron executions

## Customization

### Modify Email Times

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-emails?type=morning",
      "schedule": "0 7 * * *"  // Change hour (0-23)
    },
    {
      "path": "/api/cron/send-daily-emails?type=eod",
      "schedule": "0 20 * * *"  // Change hour (0-23)
    }
  ]
}
```

### Add More Quotes

Edit `src/lib/email.ts` - `getMotivationalQuote()` function.

### Customize Email Templates

Edit `src/lib/email-templates.ts`:
- `generateEODEmailHTML()` - End of day template
- `generateMorningEmailHTML()` - Morning template

### Modify AI Prompts

Edit `src/lib/ai.ts` - `generateMotivationalMessage()` function.

## Personal Reminders (Coming Soon)

The database is ready for personal reminders. UI for managing reminders will be added in a future update. For now, you can add them directly via SQL:

```sql
INSERT INTO personal_reminders (user_id, title, description, reminder_time, days_of_week)
VALUES (
  'your-user-id',
  'Take vitamins',
  'Don''t forget your daily vitamins',
  '08:00:00',
  ARRAY[1,2,3,4,5]  -- Monday to Friday
);
```

## Troubleshooting

### Emails Not Sending

1. **Check Resend Dashboard**
   - View logs: https://resend.com/emails
   - Look for errors

2. **Verify Environment Variables**
   - Ensure all keys are set in Vercel
   - No typos in variable names

3. **Check Cron Logs**
   - Vercel Dashboard → Functions → Cron
   - Look for execution errors

### AI Messages Not Working

1. **Verify API Key**
   - Test key in OpenAI/Gemini playground
   - Check billing/quota limits

2. **Fallback Behavior**
   - System automatically uses templates if AI fails
   - Check console logs for AI errors

### Wrong Timezone

1. **Update Profile Timezone**
   - Go to Settings → Timezone
   - Select correct timezone
   - Cron jobs respect user timezone

### Not Receiving at Set Time

- Cron runs hourly and checks if it's within 1 hour of your set time
- Emails sent based on your timezone setting
- May arrive slightly before/after exact time

## Cost Estimate

**Monthly cost for 1 user**:
- Resend: Free (under 3,000 emails)
- OpenAI: ~$0.12 (60 emails × $0.002)
- Gemini: Free
- **Total: $0-0.12/month** 🎉

## Support

For issues or questions:
1. Check Vercel function logs
2. Check Resend email logs
3. Review browser console for errors
4. Verify database migration ran successfully

---

**Enjoy your daily motivation and progress tracking! 🚀**
