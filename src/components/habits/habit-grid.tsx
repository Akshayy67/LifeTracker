'use client'

import { useMemo } from 'react'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'
import { useHabitCompletions } from '@/hooks/use-habits'
import { cn } from '@/lib/utils'

interface HabitGridProps {
  habitId: string
  days?: number
}

export function HabitGrid({ habitId, days = 90 }: HabitGridProps) {
  const { data: completions = [] } = useHabitCompletions(habitId)

  const gridData = useMemo(() => {
    const today = startOfDay(new Date())
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isCompleted = completions.some(
        c => c.completion_date === dateStr
      )
      data.push({ date, dateStr, isCompleted })
    }

    return data
  }, [completions, days])

  const weeks = useMemo(() => {
    const result: typeof gridData[] = []
    for (let i = 0; i < gridData.length; i += 7) {
      result.push(gridData.slice(i, i + 7))
    }
    return result
  }, [gridData])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last {days} days</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-green-500" />
            <span>Done</span>
          </div>
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(weeks.length, 13)}, 1fr)` }}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid gap-1">
            {week.map((day, dayIdx) => {
              const isToday = isSameDay(day.date, new Date())
              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'aspect-square rounded-sm transition-all',
                    day.isCompleted
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-muted hover:bg-accent',
                    isToday && 'ring-2 ring-primary ring-offset-1'
                  )}
                  title={`${format(day.date, 'MMM d, yyyy')} - ${day.isCompleted ? 'Completed' : 'Not completed'}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span>{format(gridData[0]?.date || new Date(), 'MMM d')}</span>
        <span>{format(gridData[gridData.length - 1]?.date || new Date(), 'MMM d')}</span>
      </div>
    </div>
  )
}
