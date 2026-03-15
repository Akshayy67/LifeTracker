'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { useJournalEntries } from '@/hooks/use-journal'
import { getMoodColor } from './mood-picker'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface JournalCalendarProps {
  currentDate: Date
  onDateSelect?: (date: Date) => void
}

export function JournalCalendar({ currentDate, onDateSelect }: JournalCalendarProps) {
  const router = useRouter()
  const { data: entries = [] } = useJournalEntries()

  const days = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const entryMap = useMemo(() => {
    const map = new Map()
    entries.forEach(entry => {
      map.set(entry.entry_date, entry)
    })
    return map
  }, [entries])

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (onDateSelect) {
      onDateSelect(date)
    } else {
      router.push(`/journal/${dateStr}`)
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const entry = entryMap.get(dateStr)
          const hasEntry = !!entry
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square rounded-lg p-2 text-sm transition-all relative',
                'hover:bg-accent hover:scale-105',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                isCurrentDay && 'ring-2 ring-primary font-bold',
                hasEntry && 'bg-accent'
              )}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {hasEntry && entry.mood && (
                <div
                  className={cn(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                    getMoodColor(entry.mood).replace('text-', 'bg-')
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
