# Supabase Backend Setup Instructions

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Supabase CLI installed (optional but recommended)

## Option 1: Using Supabase Dashboard (Recommended for Beginners)

### Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the details:
   - **Name**: life-tracker
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

### Step 2: Run Migrations

1. Go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy and paste the contents of each migration file in order:
   - `20240315000001_initial_schema.sql`
   - `20240315000002_functions.sql`
   - `20240315000003_triggers.sql`
   - `20240315000004_rls_policies.sql`
   - `20240315000005_storage.sql`
4. Click "Run" for each migration
5. Verify there are no errors

### Step 3: Configure Storage

The storage bucket is created automatically by the migration, but verify:

1. Go to **Storage** in the left sidebar
2. You should see a bucket named `journal-images`
3. Bucket settings:
   - **Public**: No (private)
   - **File size limit**: 5MB
   - **Allowed MIME types**: image/jpeg, image/jpg, image/png, image/webp, image/gif

### Step 4: Get Your Credentials

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Add these to your `.env.local` file in the Next.js project

### Step 5: Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (enabled by default)
3. Enable **Google** provider (optional):
   - Get OAuth credentials from Google Cloud Console
   - Add Client ID and Client Secret
   - Add redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://your-domain.vercel.app/auth/callback`

### Step 6: Configure URL Settings

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

---

## Option 2: Using Supabase CLI (Advanced)

### Step 1: Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link to Your Project

```bash
# Initialize Supabase in your project
cd "C:/Users/Akshay/Projects/Life Tracker"

# Link to your remote project
supabase link --project-ref your-project-ref
```

### Step 4: Push Migrations

```bash
# Push all migrations to your remote database
supabase db push
```

### Step 5: Generate TypeScript Types

```bash
# Generate types from your database schema
supabase gen types typescript --local > src/types/database.types.ts
```

---

## Verification Checklist

After setup, verify everything is working:

### Database Tables
- [ ] `profiles` table exists
- [ ] `habits` table exists
- [ ] `habit_completions` table exists
- [ ] `journal_entries` table exists
- [ ] `journal_images` table exists
- [ ] `expense_categories` table exists
- [ ] `budgets` table exists
- [ ] `expenses` table exists

### Functions
- [ ] `calculate_streak(habit_id)` function exists
- [ ] `monthly_expense_summary(user_id, year, month)` function exists
- [ ] `get_habit_completion_rate(habit_id, start_date, end_date)` function exists
- [ ] `get_total_expenses_by_period(user_id, start_date, end_date)` function exists

### Triggers
- [ ] `handle_new_user()` trigger on auth.users
- [ ] Updated_at triggers on all tables
- [ ] Validation triggers on completions, images, and expenses

### RLS Policies
- [ ] All tables have RLS enabled
- [ ] Users can only access their own data
- [ ] Policies exist for SELECT, INSERT, UPDATE, DELETE

### Storage
- [ ] `journal-images` bucket exists
- [ ] Storage policies are configured
- [ ] File size limit is 5MB
- [ ] Only image MIME types are allowed

---

## Testing the Setup

### Test 1: Create a User

1. Go to your Next.js app at `http://localhost:3000`
2. Sign up with email/password or Google
3. Check Supabase Dashboard > Authentication > Users
4. Verify user was created

### Test 2: Check Auto-Created Data

1. Go to Supabase Dashboard > Table Editor
2. Check `profiles` table - should have 1 row for your user
3. Check `expense_categories` table - should have 7 default categories

### Test 3: Test RLS Policies

1. Try to query data from the app
2. Verify you can only see your own data
3. Try to create/update/delete records
4. All operations should work for your own data only

### Test 4: Test Functions

Run in SQL Editor:

```sql
-- Test calculate_streak (will return 0 if no habits exist yet)
SELECT calculate_streak('00000000-0000-0000-0000-000000000000');

-- Test monthly_expense_summary
SELECT * FROM monthly_expense_summary(
  auth.uid(),
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
);
```

---

## Troubleshooting

### Issue: Migrations fail with permission errors

**Solution**: Make sure you're running migrations as the postgres user or with sufficient privileges.

### Issue: RLS policies blocking queries

**Solution**: 
1. Check that `auth.uid()` is returning the correct user ID
2. Verify RLS policies are correctly configured
3. Check that the user is authenticated

### Issue: Storage uploads fail

**Solution**:
1. Verify storage bucket exists
2. Check storage policies are configured
3. Ensure file size is under 5MB
4. Verify MIME type is allowed

### Issue: Triggers not firing

**Solution**:
1. Check trigger exists: `\df` in psql
2. Verify trigger is enabled
3. Check function has SECURITY DEFINER if needed

---

## Database Schema Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ├──────────────────────────────────────────┐
       │                                          │
       ▼                                          ▼
┌─────────────┐                          ┌──────────────────┐
│  profiles   │                          │ expense_categories│
└─────────────┘                          └────────┬─────────┘
                                                  │
       ┌──────────────────────────────────────────┼─────────┐
       │                                          │         │
       ▼                                          ▼         ▼
┌─────────────┐                          ┌─────────┐  ┌─────────┐
│   habits    │                          │ budgets │  │expenses │
└──────┬──────┘                          └─────────┘  └─────────┘
       │
       ▼
┌──────────────────┐
│habit_completions │
└──────────────────┘

       ┌──────────────────────────────────────────┐
       │                                          │
       ▼                                          ▼
┌─────────────────┐                      ┌──────────────┐
│journal_entries  │──────────────────────│journal_images│
└─────────────────┘                      └──────────────┘
```

---

## Next Steps

1. ✅ Complete Supabase setup
2. ✅ Run all migrations
3. ✅ Configure authentication
4. ✅ Test with a user account
5. 🚀 Start building features in your Next.js app!

For more information, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
