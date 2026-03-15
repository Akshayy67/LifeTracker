'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HabitChecklist } from '@/components/habits/habit-checklist'
import { useTodayCompletions, useHabits } from '@/hooks/use-habits'
import { useJournalEntries } from '@/hooks/use-journal'
import { useTodayExpenses } from '@/hooks/use-expenses'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Plus, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { habits } = useHabits()
  const { data: completedHabitIds = [] } = useTodayCompletions()
  const { data: journalEntries = [] } = useJournalEntries()
  const { data: todayExpenses = { total: 0, count: 0 } } = useTodayExpenses()

  const dailyHabits = habits?.filter(h => h.frequency === 'daily') || []
  const completionPercentage = dailyHabits.length > 0
    ? Math.round((completedHabitIds.length / dailyHabits.length) * 100)
    : 0

  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const monthlyEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.entry_date)
    return entryDate >= monthStart && entryDate <= monthEnd
  })

  const handleNewJournalEntry = () => {
    const todayStr = format(today, 'yyyy-MM-dd')
    router.push(`/journal/${todayStr}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Life Tracker dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedHabitIds.length}/{dailyHabits.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionPercentage}% completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayExpenses.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayExpenses.count} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Today's Habits</CardTitle>
            <CardDescription>
              Complete your daily habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HabitChecklist />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Journal</CardTitle>
                <CardDescription>
                  Capture your thoughts
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleNewJournalEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {journalEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No journal entries yet
                </p>
                <Button variant="outline" onClick={handleNewJournalEntry}>
                  Start Writing
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.slice(0, 3).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => router.push(`/journal/${entry.entry_date}`)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                    </div>
                    {entry.title && (
                      <div className="font-medium text-sm mb-1">{entry.title}</div>
                    )}
                    <div
                      className="text-xs text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
