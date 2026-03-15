# 🚀 Quick Start Guide - Life Tracker

## Step 1: Create Environment File

Create a file named `.env.local` in the project root with your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ponifijcqsvrxfpphzbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tUUsWDXelSVO1ulH3X4brA_fuIGMWRU
```

**To create this file:**

### Windows (PowerShell):
```powershell
cd "C:\Users\Akshay\Projects\Life Tracker"
New-Item -Path ".env.local" -ItemType File -Force
notepad .env.local
```

Then paste the content above and save.

### Windows (Command Prompt):
```cmd
cd "C:\Users\Akshay\Projects\Life Tracker"
echo NEXT_PUBLIC_SUPABASE_URL=https://ponifijcqsvrxfpphzbe.supabase.co > .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tUUsWDXelSVO1ulH3X4brA_fuIGMWRU >> .env.local
```

---

## Step 2: Install Dependencies

```bash
npm install
```

**Required packages will be installed:**
- Next.js, React, TypeScript
- Supabase client libraries
- UI components (Radix UI, shadcn/ui)
- TailwindCSS
- React Query
- Date utilities
- Chart libraries (Recharts)
- PWA dependencies (sonner, cmdk)

---

## Step 3: Run the Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

---

## Step 4: First Time Setup

1. **Open the app** in your browser: http://localhost:3000
2. **Sign up** for a new account (or login if you already have one)
3. **Start using** the app!

---

## 📋 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

---

## 🗄️ Database Setup (If Not Done)

If you haven't set up your Supabase database yet:

1. Go to your Supabase project: https://ponifijcqsvrxfpphzbe.supabase.co
2. Navigate to **SQL Editor**
3. Run the migrations in order:
   - `supabase/migrations/20240315000001_initial_schema.sql`
   - `supabase/migrations/20240315000002_functions.sql`
   - `supabase/migrations/20240315000003_triggers.sql`
   - `supabase/migrations/20240315000004_rls_policies.sql`
   - `supabase/migrations/20240315000005_storage.sql`

See `supabase/SETUP_INSTRUCTIONS.md` for detailed instructions.

---

## 🎨 Features Available

Once running, you can:

- ✅ **Track Habits** - Create and complete daily habits
- ✅ **Journal** - Write daily journal entries with mood tracking
- ✅ **Track Expenses** - Log expenses and manage budgets
- ✅ **View Reports** - Analytics and visualizations
- ✅ **Command Palette** - Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
- ✅ **Dark Mode** - Toggle with `Cmd+D` or from command palette
- ✅ **PWA** - Install as a desktop/mobile app

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Environment Variables Not Loading
- Restart the dev server after creating `.env.local`
- Ensure the file is in the project root
- Check for typos in variable names

### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check if your Supabase project is active
- Ensure RLS policies are set up correctly

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Mobile/PWA Setup

### Desktop Installation
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install"

### Mobile Installation
1. Open the app on your phone
2. **iOS:** Tap Share → Add to Home Screen
3. **Android:** Tap the install prompt or menu → Install App

---

## 🎯 Next Steps

1. **Create your first habit** - Go to /habits
2. **Write a journal entry** - Go to /journal
3. **Add an expense** - Go to /expenses
4. **View your analytics** - Go to /reports
5. **Explore keyboard shortcuts** - Press `Cmd+K`

---

## 📚 Documentation

- `README.md` - Project overview
- `INSTALLATION.md` - Detailed installation guide
- `SETUP.md` - Complete setup instructions
- `PWA_SETUP.md` - PWA features and configuration
- `PREMIUM_UI_GUIDE.md` - UI components and design system
- `supabase/DATABASE_SCHEMA.md` - Database structure
- `supabase/SETUP_INSTRUCTIONS.md` - Supabase setup

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error messages in the terminal
3. Check browser console for client-side errors
4. Verify Supabase setup is complete
5. Ensure all environment variables are set

---

**You're all set! Happy tracking! 🎉**
