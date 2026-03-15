import { Database } from './database.types'

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']
export type ExpenseCategoryUpdate = Database['public']['Tables']['expense_categories']['Update']

export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'other'

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory
}

export interface MonthlySummary {
  category_id: string
  category_name: string
  category_color: string
  total_amount: number
  transaction_count: number
  average_amount: number
  budget_amount: number | null
  budget_remaining: number | null
  budget_percentage: number | null
}

export interface BudgetWithCategory extends Budget {
  category: ExpenseCategory | null
}
