'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpenseCategories } from '@/hooks/use-expenses'
import { useAuth } from '@/providers/auth-provider'
import { Expense, PaymentMethod } from '@/types/expenses'

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  expense_date: z.string(),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'upi', 'bank_transfer', 'other']).optional(),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (data: ExpenseFormData) => Promise<void>
  onCancel?: () => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
]

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const { user } = useAuth()
  const { data: categories = [] } = useExpenseCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount ? Number(expense.amount) : undefined,
      category_id: expense?.category_id || '',
      description: expense?.description || '',
      expense_date: expense?.expense_date || format(new Date(), 'yyyy-MM-dd'),
      payment_method: expense?.payment_method || undefined,
      notes: expense?.notes || '',
    },
  })

  const selectedCategory = watch('category_id')
  const selectedPaymentMethod = watch('payment_method')

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setValue('category_id', category.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-accent hover:bg-accent/80'
                  }`}
                  style={{
                    borderColor: selectedCategory === category.id ? category.color : undefined,
                  }}
                >
                  <div className="font-medium">{category.name}</div>
                </button>
              ))}
            </div>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What did you buy?"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input
              id="expense_date"
              type="date"
              {...register('expense_date')}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method (Optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setValue('payment_method', method.value)}
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    selectedPaymentMethod === method.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-input'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
