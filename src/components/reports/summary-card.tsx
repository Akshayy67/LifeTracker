'use client'

import { TrendingUp, BookOpen, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSummaryStats } from '@/hooks/use-reports'

interface SummaryCardProps {
  days?: number
}

export function SummaryCard({ days = 30 }: SummaryCardProps) {
  const { data, isLoading } = useSummaryStats(days)

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-accent animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-accent animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Habits Completed',
      value: data.habitsCompleted,
      icon: Target,
      color: 'text-green-500',
    },
    {
      title: 'Journal Entries',
      value: data.journalEntries,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Total Expenses',
      value: `₹${data.totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-500',
    },
    {
      title: 'Active Habits',
      value: data.activeHabits,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last {days} days
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
