'use client'

import { Smile, Frown, Meh, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Mood } from '@/types/journal'
import { cn } from '@/lib/utils'

interface MoodPickerProps {
  value: Mood | null
  onChange: (mood: Mood) => void
  className?: string
}

const MOODS = [
  { value: 'great' as Mood, label: 'Great', icon: ThumbsUp, color: 'text-green-500' },
  { value: 'good' as Mood, label: 'Good', icon: Smile, color: 'text-blue-500' },
  { value: 'okay' as Mood, label: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { value: 'bad' as Mood, label: 'Bad', icon: Frown, color: 'text-orange-500' },
  { value: 'terrible' as Mood, label: 'Terrible', icon: ThumbsDown, color: 'text-red-500' },
]

export function MoodPicker({ value, onChange, className }: MoodPickerProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {MOODS.map((mood) => {
        const Icon = mood.icon
        const isSelected = value === mood.value

        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
              'hover:scale-105 hover:shadow-md',
              isSelected
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-transparent bg-accent hover:bg-accent/80'
            )}
            title={mood.label}
          >
            <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : mood.color)} />
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function getMoodColor(mood: Mood | null): string {
  const moodData = MOODS.find(m => m.value === mood)
  return moodData?.color || 'text-muted-foreground'
}

export function getMoodIcon(mood: Mood | null) {
  const moodData = MOODS.find(m => m.value === mood)
  return moodData?.icon || Meh
}
