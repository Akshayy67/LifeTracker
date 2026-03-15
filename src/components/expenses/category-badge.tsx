'use client'

import { ExpenseCategory } from '@/types/expenses'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: ExpenseCategory
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryBadge({ category, className, size = 'md' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: category.color,
        borderWidth: '1px',
      }}
    >
      {category.name}
    </span>
  )
}
