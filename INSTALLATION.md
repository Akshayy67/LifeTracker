# Installation Commands

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

**What this installs:**
- Next.js 15.0.3
- React 19
- TypeScript 5
- Tailwind CSS 3.4.1
- Supabase SSR & Client
- TanStack Query v5
- shadcn/ui components (Radix UI)
- react-hook-form + zod
- Recharts
- TipTap editor
- lucide-react icons
- next-themes
- date-fns

### 2. Create Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Or create manually on Windows
copy .env.example .env.local
```

Then edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## Alternative Package Managers

### Using Yarn

```bash
yarn install
yarn dev
yarn build
yarn start
```

### Using pnpm

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
```

## Vercel Deployment

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure environment variables
6. Click "Deploy"

### Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Adding More shadcn/ui Components

The project uses shadcn/ui. To add more components:

```bash
# Add a single component
npx shadcn-ui@latest add dialog

# Add multiple components
npx shadcn-ui@latest add dialog dropdown-menu toast

# List available components
npx shadcn-ui@latest add
```

**Commonly used components:**
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
```

## Troubleshooting

### Issue: Module not found errors

**Solution:** Run `npm install` to install all dependencies

### Issue: TypeScript errors

**Solution:** 
```bash
# Check types
npm run type-check

# If issues persist, delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not working

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

### Issue: Supabase connection errors

**Solution:**
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Verify redirect URLs in Supabase Dashboard

### Issue: Build fails

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check for type errors
npm run type-check

# Check for lint errors
npm run lint
```

## Development Tips

### Hot Reload

Next.js automatically reloads when you save files. If it stops working:

```bash
# Restart the dev server
# Press Ctrl+C to stop
npm run dev
```

### Clear All Caches

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next, node_modules
npm install

# Unix/Mac/Linux
rm -rf .next node_modules
npm install
```

### Type Generation for Supabase

To generate TypeScript types from your Supabase database:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Generate types
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Run development server
4. 📝 Set up Supabase database tables (see SETUP.md)
5. 🎨 Customize the app for your needs
6. 🚀 Deploy to Vercel

For detailed setup instructions, see `SETUP.md`
For project documentation, see `README.md`
