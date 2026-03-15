'use client'

import { MonthlySummary } from '@/types/expenses'
import { cn } from '@/lib/utils'

interface BudgetBarProps {
  summary: MonthlySummary
  className?: string
}

export function BudgetBar({ summary, className }: BudgetBarProps) {
  const percentage = summary.budget_percentage || 0
  const isOverBudget = percentage > 100
  const remaining = summary.budget_remaining || 0

  const getColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!summary.budget_amount) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No budget set
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          ₹{summary.total_amount.toLocaleString()} / ₹{summary.budget_amount.toLocaleString()}
        </span>
        <span className={cn('font-semibold', isOverBudget && 'text-red-500')}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all', getColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{summary.transaction_count} transactions</span>
        <span className={cn(isOverBudget && 'text-red-500 font-medium')}>
          {isOverBudget ? 'Over' : 'Remaining'}: ₹{Math.abs(remaining).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
