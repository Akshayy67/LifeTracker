'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreakBadge } from '@/components/habits/streak-badge'
import { HabitGrid } from '@/components/habits/habit-grid'
import { useHabits, useHabitCompletions, useHabitStreak } from '@/hooks/use-habits'
import { format } from 'date-fns'
import { useState } from 'react'
import { HabitForm } from '@/components/habits/habit-form'

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { habits, updateHabit, deleteHabit } = useHabits()
  const { data: completions = [] } = useHabitCompletions(id)
  const { data: streak = 0 } = useHabitStreak(id)
  const [isEditing, setIsEditing] = useState(false)

  const habit = habits?.find(h => h.id === id)

  if (!habit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Habit not found</h2>
          <p className="text-muted-foreground mb-4">
            This habit may have been deleted or doesn't exist
          </p>
          <Button onClick={() => router.push('/habits')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Habits
          </Button>
        </div>
      </div>
    )
  }

  const handleUpdate = async (data: any) => {
    await updateHabit.mutateAsync({
      id: habit.id,
      updates: data,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      await deleteHabit.mutateAsync(habit.id)
      router.push('/habits')
    }
  }

  const completionRate = completions.length > 0
    ? Math.round((completions.length / 90) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/habits')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{habit.name}</h1>
            <StreakBadge streak={streak} size="lg" />
          </div>
          {habit.description && (
            <p className="text-muted-foreground mt-1">{habit.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {isEditing && (
        <HabitForm
          habit={habit}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitGrid habitId={habit.id} days={90} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {completions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No completions yet. Start tracking this habit!
            </p>
          ) : (
            <div className="space-y-2">
              {completions.slice(0, 10).map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(completion.completion_date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  {completion.notes && (
                    <span className="text-sm text-muted-foreground">{completion.notes}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
