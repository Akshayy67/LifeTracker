'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpenseTrend } from '@/hooks/use-reports'

interface ExpenseTrendProps {
  days?: number
}

export function ExpenseTrend({ days = 30 }: ExpenseTrendProps) {
  const { data = [], isLoading } = useExpenseTrend(days)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Trend</CardTitle>
        <CardDescription>
          Daily spending over the last {days} days • Total: ₹{totalExpenses.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
