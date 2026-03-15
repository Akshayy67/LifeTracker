'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useExpenseCategories, useCreateExpense } from '@/hooks/use-expenses'
import { useAuth } from '@/providers/auth-provider'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface QuickAddSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddSheet({ isOpen, onClose }: QuickAddSheetProps) {
  const { user } = useAuth()
  const { data: categories = [] } = useExpenseCategories()
  const createMutation = useCreateExpense()
  
  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    if (!user || !amount || !selectedCategoryId) return

    await createMutation.mutateAsync({
      user_id: user.id,
      amount: parseFloat(amount),
      category_id: selectedCategoryId,
      description: description || null,
      expense_date: format(new Date(), 'yyyy-MM-dd'),
    })

    // Reset form
    setAmount('')
    setSelectedCategoryId('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t rounded-t-2xl z-50 md:hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Quick Add Expense</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-2xl font-bold pl-10 h-14"
                autoFocus
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all',
                    selectedCategoryId === category.id
                      ? 'border-primary bg-primary/10 scale-95'
                      : 'border-transparent bg-accent'
                  )}
                  style={{
                    borderColor: selectedCategoryId === category.id ? category.color : undefined,
                  }}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you buy?"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || !selectedCategoryId || createMutation.isPending}
            className="w-full h-12 text-lg"
          >
            {createMutation.isPending ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </div>
    </>
  )
}

export function QuickAddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-30"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
