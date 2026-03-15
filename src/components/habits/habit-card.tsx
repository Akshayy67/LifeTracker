'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MoreVertical, Edit, Trash2, Check,
  Circle, Star, Heart, Zap, Target, Award, BookOpen, Dumbbell,
  Sun, Moon, Coffee, Droplets, Flame, Music, Bike, Brain,
  type LucideIcon
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreakBadge } from './streak-badge'
import { Habit } from '@/types/habits'
import { useHabitStreak } from '@/hooks/use-habits'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  star: Star,
  heart: Heart,
  zap: Zap,
  target: Target,
  award: Award,
  book: BookOpen,
  dumbbell: Dumbbell,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  droplets: Droplets,
  flame: Flame,
  music: Music,
  bike: Bike,
  brain: Brain,
}

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
    <Card className="group relative transition-all hover:shadow-md">
      {habit.background_image && (
        <>
          <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
            <img
              src={habit.background_image}
              alt={habit.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div 
            className="absolute inset-0 z-0 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${habit.color}dd 0%, ${habit.color}99 50%, ${habit.color}cc 100%)`
            }}
          />
        </>
      )}
      
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg z-10"
        style={{ backgroundColor: habit.color }}
      />
      
      <div className="relative z-10 p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {habit.icon && ICON_MAP[habit.icon] && (() => {
                const IconComponent = ICON_MAP[habit.icon]
                return (
                  <div 
                    className="flex items-center justify-center h-8 w-8 rounded-lg"
                    style={{ backgroundColor: habit.color, color: 'white' }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                )
              })()}
              <Link
                href={`/habits/${habit.id}`}
                className={cn(
                  "font-semibold text-base hover:text-primary transition-colors truncate",
                  habit.background_image && "text-white hover:text-white/90"
                )}
              >
                {habit.name}
              </Link>
              <StreakBadge streak={streak} size="sm" />
            </div>
            
            {habit.description && (
              <p className={cn(
                "text-sm line-clamp-2 mb-2",
                habit.background_image ? "text-white/90" : "text-muted-foreground"
              )}>
                {habit.description}
              </p>
            )}
            
            <div className={cn(
              "flex items-center gap-3 text-xs",
              habit.background_image ? "text-white/80" : "text-muted-foreground"
            )}>
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
                      className="fixed inset-0 z-[100]"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-popover border rounded-md shadow-lg z-[101] py-1">
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
