'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Wallet, 
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Habits',
    icon: CheckSquare,
    href: '/habits',
  },
  {
    label: 'Journal',
    icon: BookOpen,
    href: '/journal',
  },
  {
    label: 'Expenses',
    icon: Wallet,
    href: '/expenses',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around h-16">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
              pathname === route.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{route.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
