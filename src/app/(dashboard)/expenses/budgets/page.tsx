'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetBar } from '@/components/expenses/budget-bar'
import { CategoryBadge } from '@/components/expenses/category-badge'
import { 
  useBudgets, 
  useCreateBudget, 
  useUpdateBudget, 
  useDeleteBudget,
  useExpenseCategories,
  useMonthlySummary 
} from '@/hooks/use-expenses'
import { useAuth } from '@/providers/auth-provider'
import { Budget } from '@/types/expenses'

export default function BudgetsPage() {
  const { user } = useAuth()
  const today = new Date()
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets()
  const { data: categories = [] } = useExpenseCategories()
  const { data: summary = [] } = useMonthlySummary(today.getFullYear(), today.getMonth() + 1)
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const deleteMutation = useDeleteBudget()

  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedCategoryId || !amount) return

    if (editingBudget) {
      await updateMutation.mutateAsync({
        id: editingBudget.id,
        updates: {
          amount: parseFloat(amount),
          category_id: selectedCategoryId,
        },
      })
    } else {
      await createMutation.mutateAsync({
        user_id: user.id,
        category_id: selectedCategoryId,
        amount: parseFloat(amount),
        period: 'monthly',
        active: true,
      })
    }

    setShowForm(false)
    setEditingBudget(null)
    setSelectedCategoryId('')
    setAmount('')
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setSelectedCategoryId(budget.category_id)
    setAmount(budget.amount.toString())
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (budgetsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-accent animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-accent animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits for each category
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedCategoryId === category.id
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent bg-accent'
                      }`}
                      style={{
                        borderColor: selectedCategoryId === category.id ? category.color : undefined,
                      }}
                    >
                      <div className="font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Budget (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingBudget(null)
                    setSelectedCategoryId('')
                    setAmount('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {summary.map((item) => {
          const budget = budgets.find(b => b.category_id === item.category_id)
          
          return (
            <Card key={item.category_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: item.category_color }}
                    />
                    <div>
                      <CategoryBadge
                        category={{
                          id: item.category_id,
                          name: item.category_name,
                          color: item.category_color,
                        } as any}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.transaction_count} transactions
                      </p>
                    </div>
                  </div>
                  {budget && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <BudgetBar summary={item} />
              </CardContent>
            </Card>
          )
        })}

        {summary.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No expenses this month yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
