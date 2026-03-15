'use client'

import { HabitCard } from './habit-card'
import { useHabits, useTodayCompletions } from '@/hooks/use-habits'
import { useAuth } from '@/providers/auth-provider'

export function HabitChecklist() {
  const { user } = useAuth()
  const { habits, isLoading, toggleCompletion } = useHabits()
  const { data: completedHabitIds = [] } = useTodayCompletions()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-accent animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!habits || habits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No habits yet. Create your first habit to get started!</p>
      </div>
    )
  }

  const dailyHabits = habits.filter(h => h.frequency === 'daily')

  if (dailyHabits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No daily habits to track today.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dailyHabits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompleted={completedHabitIds.includes(habit.id)}
          onToggle={() => toggleCompletion.mutate({ habitId: habit.id })}
          showActions={false}
        />
      ))}
    </div>
  )
}
