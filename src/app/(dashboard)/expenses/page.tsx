'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { ExpenseRow } from '@/components/expenses/expense-row'
import { QuickAddSheet, QuickAddButton } from '@/components/expenses/quick-add-sheet'
import { useExpenses, useUpdateExpense, useDeleteExpense, useExpenseCategories, useCreateExpense } from '@/hooks/use-expenses'
import { useAuth } from '@/providers/auth-provider'
import { Expense } from '@/types/expenses'

export default function ExpensesPage() {
  const { user } = useAuth()
  const today = new Date()
  const [startDate] = useState(startOfMonth(today))
  const [endDate] = useState(endOfMonth(today))
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: expenses = [], isLoading } = useExpenses(startDate, endDate)
  const { data: categories = [] } = useExpenseCategories()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const deleteMutation = useDeleteExpense()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category_id === selectedCategory)

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync({
      ...data,
      user_id: user!.id,
    })
    setShowForm(false)
  }

  const handleUpdate = async (data: any) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({
        id: editingExpense.id,
        updates: data,
      })
      setEditingExpense(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-accent animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-accent animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track your spending for {format(today, 'MMMM yyyy')}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="hidden md:flex">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Summary</CardTitle>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredExpenses.length} transactions</span>
              <span>
                Avg: ₹{filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(0) : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(showForm || editingExpense) && (
        <ExpenseForm
          expense={editingExpense || undefined}
          onSubmit={editingExpense ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingExpense(null)
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No expenses yet. Start tracking your spending!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setEditingExpense(expense)}
                  onDelete={() => handleDelete(expense.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuickAddButton onClick={() => setShowQuickAdd(true)} />
      <QuickAddSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  )
}
