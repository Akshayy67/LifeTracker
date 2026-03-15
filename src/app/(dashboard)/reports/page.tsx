'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SummaryCard } from '@/components/reports/summary-card'
import { HabitChart } from '@/components/reports/habit-chart'
import { ExpensePie } from '@/components/reports/expense-pie'
import { ExpenseTrend } from '@/components/reports/expense-trend'
import { MoodTrend } from '@/components/reports/mood-trend'
import { StreakTable } from '@/components/reports/streak-table'

export default function ReportsPage() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your habits, expenses, and well-being
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 7 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(7)}
          >
            7 Days
          </Button>
          <Button
            variant={period === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(30)}
          >
            30 Days
          </Button>
          <Button
            variant={period === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      <SummaryCard days={period} />

      <div className="grid gap-6 md:grid-cols-2">
        <HabitChart days={period} />
        <ExpensePie days={period} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseTrend days={period} />
        <MoodTrend days={period} />
      </div>

      <StreakTable />
    </div>
  )
}
