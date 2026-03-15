'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMoodTrend } from '@/hooks/use-reports'

interface MoodTrendProps {
  days?: number
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}

export function MoodTrend({ days = 30 }: MoodTrendProps) {
  const { data = [], isLoading } = useMoodTrend(days)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trend</CardTitle>
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
          <CardTitle>Mood Trend</CardTitle>
          <CardDescription>Track your emotional well-being</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No mood data recorded
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageMood = data.reduce((sum, item) => sum + item.mood, 0) / data.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trend</CardTitle>
        <CardDescription>
          Emotional well-being over time • Average: {MOOD_LABELS[Math.round(averageMood)]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => MOOD_LABELS[value]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [MOOD_LABELS[value], 'Mood']}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
