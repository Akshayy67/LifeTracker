'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/providers/auth-provider'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const { user } = useAuth()

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold md:hidden">Life Tracker</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email ? getInitials(user.email) : 'LT'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
