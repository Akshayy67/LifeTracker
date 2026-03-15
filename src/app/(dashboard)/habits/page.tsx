'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { useHabits, useTodayCompletions } from '@/hooks/use-habits'
import { useAuth } from '@/providers/auth-provider'
import { Habit } from '@/types/habits'

export default function HabitsPage() {
  const { user } = useAuth()
  const { habits, isLoading, createHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits()
  const { data: completedHabitIds = [] } = useTodayCompletions()
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const handleCreate = async (data: any) => {
    await createHabit.mutateAsync({
      ...data,
      user_id: user!.id,
    })
    setShowForm(false)
  }

  const handleUpdate = async (data: any) => {
    if (editingHabit) {
      await updateHabit.mutateAsync({
        id: editingHabit.id,
        updates: data,
      })
      setEditingHabit(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-accent animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-accent animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Track your daily, weekly, and monthly habits
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </div>

      {(showForm || editingHabit) && (
        <HabitForm
          habit={editingHabit || undefined}
          onSubmit={editingHabit ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingHabit(null)
          }}
        />
      )}

      {!habits || habits.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first habit to start building better routines
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Habits */}
          {habits.filter(h => h.frequency === 'daily').length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Daily Habits</h2>
              <div className="grid gap-3">
                {habits
                  .filter(h => h.frequency === 'daily')
                  .map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={completedHabitIds.includes(habit.id)}
                      onToggle={() => toggleCompletion.mutate({ habitId: habit.id })}
                      onEdit={() => setEditingHabit(habit)}
                      onDelete={() => handleDelete(habit.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Weekly Habits */}
          {habits.filter(h => h.frequency === 'weekly').length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Weekly Habits</h2>
              <div className="grid gap-3">
                {habits
                  .filter(h => h.frequency === 'weekly')
                  .map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={completedHabitIds.includes(habit.id)}
                      onToggle={() => toggleCompletion.mutate({ habitId: habit.id })}
                      onEdit={() => setEditingHabit(habit)}
                      onDelete={() => handleDelete(habit.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Monthly Habits */}
          {habits.filter(h => h.frequency === 'monthly').length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Monthly Habits</h2>
              <div className="grid gap-3">
                {habits
                  .filter(h => h.frequency === 'monthly')
                  .map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={completedHabitIds.includes(habit.id)}
                      onToggle={() => toggleCompletion.mutate({ habitId: habit.id })}
                      onEdit={() => setEditingHabit(habit)}
                      onDelete={() => handleDelete(habit.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
