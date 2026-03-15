# Setup Guide for Life Tracker

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- TanStack Query
- shadcn/ui components
- And all other dependencies

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: life-tracker
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Wait for project to be created

#### Get Your Credentials

1. Go to Project Settings > API
2. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste them into your `.env.local` file

#### Enable Google OAuth (Optional)

1. Go to Authentication > Providers in Supabase Dashboard
2. Find Google provider and click to configure
3. Enable the provider
4. Add OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.vercel.app/auth/callback` (production)
5. Copy Client ID and Client Secret to Supabase
6. Save configuration

#### Configure Redirect URLs

1. Go to Authentication > URL Configuration
2. Add Site URL: `http://localhost:3000` (development)
3. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback` (when deployed)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First User

Since this is a fresh setup, you'll need to create a user:

**Option 1: Using Email/Password**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter email and password
4. User will be created
5. Use these credentials to log in

**Option 2: Using Google OAuth**
1. Make sure Google OAuth is configured (see above)
2. Click "Continue with Google" on login page
3. Authorize the app
4. You'll be redirected to dashboard

## Database Schema (To Be Created)

You'll need to create the following tables in Supabase:

### Habits Table

```sql
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  frequency text not null, -- daily, weekly, monthly
  target_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table habits enable row level security;

-- Create policies
create policy "Users can view their own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can create their own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on habits for delete
  using (auth.uid() = user_id);
```

### Habit Logs Table

```sql
create table habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits on delete cascade not null,
  user_id uuid references auth.users not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text
);

-- Enable RLS
alter table habit_logs enable row level security;

-- Create policies
create policy "Users can view their own habit logs"
  on habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their own habit logs"
  on habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own habit logs"
  on habit_logs for delete
  using (auth.uid() = user_id);
```

### Journal Entries Table

```sql
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text,
  content text not null,
  mood text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table journal_entries enable row level security;

-- Create policies
create policy "Users can view their own journal entries"
  on journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own journal entries"
  on journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
  on journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
  on journal_entries for delete
  using (auth.uid() = user_id);
```

### Expenses Table

```sql
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount decimal(10, 2) not null,
  category text not null,
  description text,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table expenses enable row level security;

-- Create policies
create policy "Users can view their own expenses"
  on expenses for select
  using (auth.uid() = user_id);

create policy "Users can create their own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on expenses for delete
  using (auth.uid() = user_id);
```

## Adding shadcn/ui Components

The project is pre-configured for shadcn/ui. To add more components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

## Troubleshooting

### TypeScript Errors
The lint errors you see are expected before running `npm install`. They will be resolved once dependencies are installed.

### Supabase Connection Issues
- Verify your `.env.local` file has correct credentials
- Check that your Supabase project is active
- Ensure redirect URLs are properly configured

### Build Errors
- Run `npm run type-check` to identify TypeScript issues
- Run `npm run lint` to check for linting errors
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

1. Install dependencies
2. Configure Supabase
3. Create database tables
4. Run the app
5. Start building features!

Refer to the main README.md for more detailed information about the project structure and architecture.
