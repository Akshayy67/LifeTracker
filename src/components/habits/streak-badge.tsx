'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  streak: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ streak, className, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  if (streak === 0) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        sizeClasses[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], 'fill-current')} />
      <span>{streak}</span>
    </div>
  )
}
