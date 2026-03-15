# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 406 Error on Habit Completions

**Error:**
```
GET https://[your-supabase-url]/rest/v1/habit_completions?select=id&habit_id=eq.[id]&completion_date=eq.2026-03-15 406 (Not Acceptable)
```

**Cause:**
This error occurs when the database schema is out of sync with your code. Specifically, when:
1. You've added new columns to tables (like `strict_mode`, `verification_prompt` to `habits`)
2. The migrations haven't been run yet
3. Supabase is rejecting queries because the schema doesn't match

**Solution:**

**1. Run All Pending Migrations**

Go to your Supabase Dashboard → SQL Editor and run these migrations in order:

```sql
-- Migration 1: Goals System
-- File: supabase/migrations/20240315000012_add_goals_system.sql

-- Migration 2: Strict Habit Verification
-- File: supabase/migrations/20240315000013_add_strict_habit_verification.sql

-- Migration 3: AI Reviews
-- File: supabase/migrations/20240315000014_add_ai_reviews.sql
```

**2. Regenerate TypeScript Types**

After running migrations, regenerate your Supabase types:

```bash
npx supabase gen types typescript --project-id [your-project-id] > src/types/database.types.ts
```

**3. Restart Your Dev Server**

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

---

### Strict Mode Habits Not Opening Camera

**Issue:**
Clicking on a strict mode habit doesn't open the camera for verification.

**Cause:**
The `HabitCard` component was using a simple toggle button instead of the `HabitCompletionButton` component that handles strict mode.

**Solution:**
Already fixed! The `HabitCard` now uses `HabitCompletionButton` which:
- Detects if habit has `strict_mode` enabled
- Opens camera automatically for strict habits
- Handles AI verification flow
- Shows camera icon (📷) for strict habits vs checkmark (✓) for normal habits

**Verify it's working:**
1. Create a habit with strict mode enabled
2. Click the completion button
3. Camera should open automatically
4. Take photo → AI verifies → Auto-complete

---

### TypeScript Errors After Adding New Features

**Error:**
```
Property 'strict_mode' does not exist on type 'Habit'
Property 'ultimate_goal' does not exist on type 'Profile'
```

**Cause:**
TypeScript types haven't been regenerated after database schema changes.

**Solution:**

**Option 1: Run Migrations First (Recommended)**
1. Run all pending migrations in Supabase
2. Regenerate types:
```bash
npx supabase gen types typescript --project-id [your-project-id] > src/types/database.types.ts
```

**Option 2: Temporary Fix (Development Only)**
Add type assertions where needed:
```typescript
const strictMode = (habit as any).strict_mode || false
```

---

### Camera Won't Open in Browser

**Error:**
"Unable to access camera. Please grant camera permissions."

**Solutions:**

**1. Grant Browser Permissions**
- Chrome: Click lock icon in address bar → Camera → Allow
- Safari: Safari → Settings → Websites → Camera → Allow
- Firefox: Click shield icon → Permissions → Camera → Allow

**2. Use HTTPS**
Camera API requires HTTPS in production. For local development:
- Use `localhost` (works without HTTPS)
- Or set up local SSL certificate

**3. Check Browser Compatibility**
Supported browsers:
- Chrome 53+
- Safari 11+
- Firefox 36+
- Edge 79+

**4. Try Different Browser**
If one browser doesn't work, try Chrome or Safari.

---

### AI Review Email Not Received

**Issue:**
Clicked "Submit + AI Review" but no email arrived.

**Troubleshooting Steps:**

**1. Check Email Service Configuration**
Verify environment variables:
```env
RESEND_API_KEY=re_xxxxx
# OR
SENDGRID_API_KEY=SG.xxxxx
```

**2. Check Spam Folder**
AI review emails might be filtered as spam initially.

**3. Verify Email in Profile**
- Go to Settings/Profile
- Confirm email address is correct
- Check `ai_review_enabled` is true

**4. Check Server Logs**
Look for errors in the console:
```
Error generating expense analysis: ...
Email send failed: ...
```

**5. Test Email Service**
Try sending a test email through your email service dashboard.

---

### AI Verification Always Fails

**Issue:**
Photos are always rejected by AI verification, even when they clearly show the habit.

**Solutions:**

**1. Review Verification Prompt**
- Edit the habit
- Check the verification prompt
- Make it less strict or more specific
- Example: Instead of "perfect gym photo", use "gym equipment visible or workout in progress"

**2. Improve Photo Quality**
- Better lighting
- Show the activity clearly
- Include context (equipment, environment)
- Don't use screenshots or old photos

**3. Check AI Service**
Verify API keys are set:
```env
OPENAI_API_KEY=sk-xxxxx
# OR
GEMINI_API_KEY=xxxxx
```

**4. Test with Obvious Photos**
Try an extremely obvious photo first:
- Gym: You holding dumbbells in front of mirror
- Reading: Open book with text clearly visible
- Cooking: Food cooking on stove

**5. Check Verification Score**
Look at the feedback message - it shows the score (0-100).
- Score ≥ 70: Passes
- Score < 70: Fails
Adjust your prompt based on the feedback.

---

### Database Migration Errors

**Error:**
```sql
ERROR: relation "goals" already exists
ERROR: column "strict_mode" already exists
```

**Cause:**
Migration was partially run or run multiple times.

**Solution:**

**1. Check What Exists**
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'goals'
);

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'habits' 
AND column_name = 'strict_mode';
```

**2. Skip Existing Parts**
Modify migration to use `IF NOT EXISTS`:
```sql
CREATE TABLE IF NOT EXISTS public.goals (...);
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS strict_mode BOOLEAN DEFAULT false;
```

**3. Or Drop and Recreate (Development Only)**
```sql
DROP TABLE IF EXISTS public.goals CASCADE;
-- Then run full migration
```

---

### Expense Analysis Not Showing in Emails

**Issue:**
Daily emails don't include expense breakdown and AI insights.

**Troubleshooting:**

**1. Check Migration**
Ensure expense AI functions are available:
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

**2. Verify Expense Data**
- Add some expenses for today
- Check they're in the database
- Verify categories and budgets are set

**3. Check Email Template**
Look for `expenseHTML` in the email output.

**4. Test Expense Analysis Directly**
```typescript
import { analyzeExpenses } from '@/lib/expense-ai'
const analysis = await analyzeExpenses(userId)
console.log(analysis)
```

---

## Quick Fixes Checklist

When something isn't working:

- [ ] Run all pending migrations
- [ ] Regenerate TypeScript types
- [ ] Restart dev server
- [ ] Clear browser cache
- [ ] Check environment variables
- [ ] Verify API keys are valid
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Try in incognito/private mode
- [ ] Try different browser

---

## Getting Help

If issues persist:

1. **Check the logs** - Browser console and server logs
2. **Review the error message** - Often tells you exactly what's wrong
3. **Verify setup** - Environment variables, migrations, API keys
4. **Test in isolation** - Try the feature in a minimal test case
5. **Check documentation** - Review the relevant guide (GOALS_SYSTEM_GUIDE.md, STRICT_HABIT_VERIFICATION.md, etc.)

---

**Most issues are resolved by running migrations and regenerating types!** 🚀
