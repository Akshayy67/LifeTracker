'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Edit, Trash2, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreakBadge } from './streak-badge'
import { Habit } from '@/types/habits'
import { useHabitStreak } from '@/hooks/use-habits'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  habit: Habit
  isCompleted?: boolean
  onToggle?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export function HabitCard({
  habit,
  isCompleted = false,
  onToggle,
  onEdit,
  onDelete,
  showActions = true,
}: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { data: streak = 0 } = useHabitStreak(habit.id)

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: habit.color }}
      />
      
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/habits/${habit.id}`}
                className="font-semibold text-base hover:text-primary transition-colors truncate"
              >
                {habit.name}
              </Link>
              <StreakBadge streak={streak} size="sm" />
            </div>
            
            {habit.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {habit.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="capitalize">{habit.frequency}</span>
              {habit.target_count > 1 && (
                <span>Target: {habit.target_count}x</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggle && (
              <button
                onClick={onToggle}
                className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-lg border-2 transition-all',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-input hover:border-primary hover:bg-accent'
                )}
              >
                {isCompleted && <Check className="h-5 w-5" />}
              </button>
            )}

            {showActions && (onEdit || onDelete) && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-popover border rounded-md shadow-lg z-20 py-1">
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit()
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete()
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
