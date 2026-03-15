# Life Tracker

A production-grade personal life tracker web application built with Next.js 15, featuring habits tracking, journaling, expense management, and comprehensive reports.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **State Management**: TanStack Query v5
- **Forms**: react-hook-form + zod
- **Charts**: Recharts
- **Editor**: TipTap
- **Icons**: lucide-react
- **Theme**: next-themes
- **Date Utilities**: date-fns
- **PWA**: Progressive Web App support
- **Deployment**: Vercel

## 📁 Project Structure

```
life-tracker/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard page
│   │   │   └── layout.tsx     # Dashboard layout with sidebar
│   │   ├── auth/
│   │   │   └── callback/      # OAuth callback handler
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects to dashboard)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # Desktop sidebar navigation
│   │   │   ├── mobile-nav.tsx # Mobile bottom navigation
│   │   │   └── header.tsx     # Header component
│   │   ├── ui/                # shadcn/ui components
│   │   └── theme-toggle.tsx   # Theme switcher
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser Supabase client
│   │   │   └── server.ts      # Server Supabase client
│   │   └── utils.ts           # Utility functions
│   ├── providers/
│   │   ├── query-provider.tsx # TanStack Query provider
│   │   ├── theme-provider.tsx # Theme provider
│   │   └── auth-provider.tsx  # Auth context provider
│   └── middleware.ts          # Auth middleware
├── .env.example               # Environment variables template
├── components.json            # shadcn/ui configuration
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies

```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

### Steps

1. **Clone the repository**
   ```bash
   cd "C:/Users/Akshay/Projects/Life Tracker"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configure Supabase**
   
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key to `.env.local`
   - Enable Google OAuth in Supabase Dashboard:
     - Go to Authentication > Providers
     - Enable Google provider
     - Add your OAuth credentials
     - Add `http://localhost:3000/auth/callback` to redirect URLs

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Features

### Authentication
- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ Automatic redirects

### Layout
- ✅ Responsive sidebar (desktop)
- ✅ Bottom navigation (mobile)
- ✅ Dark/Light theme toggle
- ✅ User avatar display
- ✅ Clean, modern UI

### Dashboard
- ✅ Overview cards
- ✅ Activity tracking
- ✅ Quick stats display
- 🚧 Charts and graphs (placeholder)

### Future Modules
- 🚧 Habits tracking
- 🚧 Journal entries with TipTap editor
- 🚧 Expense management
- 🚧 Reports and analytics
- 🚧 Settings page

## 🚀 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (your production URL)

3. **Update Supabase redirect URLs**
   - Add your Vercel URL to Supabase redirect URLs
   - Format: `https://your-app.vercel.app/auth/callback`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch

## 🏗️ Architecture Decisions

### Next.js 15 App Router
- **Server Components**: Default for better performance
- **Client Components**: Only where interactivity is needed
- **Route Groups**: Organized with `(dashboard)` for protected routes
- **Middleware**: Authentication guard at the edge

### Supabase Integration
- **Three Client Types**:
  - Browser client for client components
  - Server client for server components/actions
  - Middleware client for edge runtime
- **Cookie-based sessions**: Secure, server-side session management
- **Row Level Security**: Database-level authorization (to be configured)

### State Management
- **TanStack Query**: Server state and caching
- **React Context**: Auth state and theme
- **URL State**: Navigation and filters

### Styling Approach
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible, customizable components
- **CSS Variables**: Theme tokens for consistency
- **Responsive Design**: Mobile-first approach

### Type Safety
- **TypeScript**: Strict mode enabled
- **Zod**: Runtime validation for forms
- **Supabase Types**: Auto-generated database types (to be added)

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ Server-side session validation
- ✅ CSRF protection via Supabase
- ✅ Secure cookie handling
- 🚧 Row Level Security policies (to be configured in Supabase)

## 📱 PWA Support

The app includes PWA configuration for installability:
- Manifest file with app metadata
- Icons for different sizes
- Standalone display mode
- Offline support (to be enhanced with service worker)

## 🤝 Contributing

This is a personal project template. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project as a template for your own applications.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query)

---

Built with ❤️ using modern web technologies
