# Authentication System Documentation

## Overview

The Life Tracker authentication system is built with Supabase Auth and Next.js 15 App Router, providing secure authentication with SSR support, session persistence, and protected routes.

## Features

- ✅ Email/Password signup and signin
- ✅ Google OAuth login
- ✅ Session persistence across page reloads
- ✅ Protected routes with middleware
- ✅ Automatic profile creation on signup
- ✅ Profile auto-fetch in AuthProvider
- ✅ Server-side and client-side authentication
- ✅ Redirect URL preservation
- ✅ Logout functionality

## Architecture

### 1. Supabase Clients

#### Browser Client (`src/lib/supabase/client.ts`)
Used in Client Components for client-side authentication operations.

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

#### Server Client (`src/lib/supabase/server.ts`)
Used in Server Components, Route Handlers, and Server Actions for server-side operations.

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### 2. Middleware (`src/middleware.ts`)

Handles authentication at the edge:
- Refreshes sessions automatically
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Preserves redirect URLs in query parameters
- Excludes public routes: `/login`, `/auth/callback`

### 3. Auth Provider (`src/providers/auth-provider.tsx`)

Provides authentication context to the entire app:
- Manages user session state
- Auto-fetches user profile from database
- Listens for auth state changes
- Provides `refreshProfile()` function
- Available via `useAuth()` hook

### 4. Server Actions (`src/lib/auth/actions.ts`)

Server-side authentication functions:
- `signUp(formData)` - Create new account
- `signIn(formData)` - Sign in with email/password
- `signOut()` - Sign out current user
- `getUser()` - Get current user
- `getProfile()` - Get user profile

## Usage Examples

### Client Component Authentication

```typescript
'use client'

import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const { user, profile, loading } = useAuth()
  const supabase = createClient()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123'
    })
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Welcome {profile?.full_name}</div>
}
```

### Server Component Authentication

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <div>Welcome {profile.full_name}</div>
}
```

### Using Server Actions

```typescript
'use client'

import { signIn, signOut } from '@/lib/auth/actions'

export function LoginForm() {
  return (
    <form action={signIn}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Using Hooks

```typescript
'use client'

import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/hooks/use-profile'

export function UserInfo() {
  const { user, loading } = useUser()
  const { profile, refreshProfile } = useProfile()

  return (
    <div>
      <p>{user?.email}</p>
      <p>{profile?.full_name}</p>
      <button onClick={refreshProfile}>Refresh</button>
    </div>
  )
}
```

### Logout Button

```typescript
import { LogoutButton } from '@/components/auth/logout-button'

export function Header() {
  return (
    <header>
      <LogoutButton variant="ghost" showIcon showText />
    </header>
  )
}
```

### Protected Route Component

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
```

## Authentication Flow

### Email/Password Signup

1. User fills signup form on `/login` page
2. Form submits to `handleEmailSignUp()`
3. Supabase creates user account
4. Trigger `handle_new_user()` creates profile + default categories
5. User receives confirmation email
6. User clicks confirmation link
7. Redirected to `/auth/callback`
8. Session established, redirected to `/dashboard`

### Email/Password Signin

1. User fills signin form on `/login` page
2. Form submits to `handleEmailSignIn()`
3. Supabase validates credentials
4. Session created
5. User redirected to intended page or `/dashboard`

### Google OAuth

1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes app
4. Google redirects to `/auth/callback?code=...`
5. Callback handler exchanges code for session
6. User redirected to intended page or `/dashboard`

### Session Persistence

1. Middleware runs on every request
2. Checks for valid session cookie
3. Refreshes session if expired
4. Updates cookies with new session
5. Server Components can access session

### Logout

1. User clicks logout button
2. `LogoutButton` calls `supabase.auth.signOut()`
3. Session cleared from cookies
4. User redirected to `/login`
5. Middleware prevents access to protected routes

## Protected Routes

Routes are protected by middleware. All routes except `/login` and `/auth/callback` require authentication.

To add public routes, update `middleware.ts`:

```typescript
const publicRoutes = ['/login', '/auth/callback', '/about', '/pricing']
```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Integration

### Profile Auto-Creation

When a user signs up, the `handle_new_user()` trigger automatically:
1. Creates a profile record in `profiles` table
2. Seeds 7 default expense categories
3. Syncs user metadata (full_name, avatar_url)

### Profile Structure

```typescript
type Profile = {
  id: string              // Same as auth.users.id
  email: string
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}
```

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Session cookies are httpOnly and secure
- ✅ CSRF protection via Supabase
- ✅ Middleware validates sessions on every request
- ✅ Server-side session validation in Server Components

## Troubleshooting

### "User not authenticated" in Server Component

Make sure you're using `await createClient()` and checking the user:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Session not persisting

1. Check middleware is running (should see session refresh)
2. Verify cookies are being set (check browser DevTools)
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### OAuth redirect not working

1. Verify redirect URL in Supabase Dashboard matches your callback route
2. Check `NEXT_PUBLIC_APP_URL` is set correctly
3. Ensure `/auth/callback` route exists

### Profile not loading

1. Check `handle_new_user()` trigger is installed
2. Verify RLS policies allow user to read their profile
3. Check AuthProvider is wrapping your app

## Best Practices

1. **Use Server Components when possible** - Better performance and security
2. **Use middleware for route protection** - Don't rely on client-side checks
3. **Validate sessions server-side** - Never trust client-side auth state
4. **Use Server Actions for mutations** - Safer than client-side API calls
5. **Refresh profile after updates** - Call `refreshProfile()` after profile changes

## Next Steps

- Add password reset functionality
- Implement email verification flow
- Add more OAuth providers (GitHub, Facebook)
- Add two-factor authentication
- Implement session management (view active sessions)
