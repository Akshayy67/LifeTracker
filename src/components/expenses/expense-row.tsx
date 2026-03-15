'use client'

import { format } from 'date-fns'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from './category-badge'
import { ExpenseWithCategory } from '@/types/expenses'
import { cn } from '@/lib/utils'

interface ExpenseRowProps {
  expense: ExpenseWithCategory
  onEdit?: () => void
  onDelete?: () => void
}

export function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
      <div
        className="w-1 h-12 rounded-full"
        style={{ backgroundColor: expense.category.color }}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <CategoryBadge category={expense.category} size="sm" />
          {expense.payment_method && (
            <span className="text-xs text-muted-foreground capitalize">
              {expense.payment_method.replace('_', ' ')}
            </span>
          )}
        </div>
        {expense.description && (
          <p className="text-sm font-medium truncate">{expense.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {format(new Date(expense.expense_date), 'MMM d, yyyy')}
        </p>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold">₹{Number(expense.amount).toLocaleString()}</div>
      </div>

      {(onEdit || onDelete) && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-32 bg-popover border rounded-md shadow-lg z-20 py-1">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
