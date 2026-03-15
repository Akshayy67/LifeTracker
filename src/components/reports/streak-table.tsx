'use client'

import { Flame } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStreakLeaderboard } from '@/hooks/use-reports'

export function StreakTable() {
  const { data = [], isLoading } = useStreakLeaderboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Leaderboard</CardTitle>
          <CardDescription>Top habits by current streak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No active habits
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Leaderboard</CardTitle>
        <CardDescription>Top habits by current streak</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((habit, index) => (
            <div
              key={habit.id}
              className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                {index + 1}
              </div>
              
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{habit.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {habit.frequency}
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                <Flame className="h-4 w-4 fill-current" />
                <span>{habit.streak}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
