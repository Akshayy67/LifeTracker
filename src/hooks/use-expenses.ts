'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import {
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseCategory,
  Budget,
  BudgetInsert,
  BudgetUpdate,
  MonthlySummary
} from '@/types/expenses'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function useExpenses(startDate?: Date, endDate?: Date) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['expenses', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })

      if (startDate) {
        query = query.gte('expense_date', format(startDate, 'yyyy-MM-dd'))
      }
      if (endDate) {
        query = query.lte('expense_date', format(endDate, 'yyyy-MM-dd'))
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useExpenseCategories() {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: ['expense-categories', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as ExpenseCategory[]
    },
    enabled: !!user,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select(`
          *,
          category:expense_categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['today-expenses'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExpenseUpdate }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:expense_categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['today-expenses'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
      queryClient.invalidateQueries({ queryKey: ['today-expenses'] })
    },
  })
}

export function useMonthlySummary(year: number, month: number) {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: ['monthly-summary', user?.id, year, month],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase.rpc('monthly_expense_summary', {
        p_user_id: user.id,
        p_year: year,
        p_month: month,
      })

      if (error) throw error
      return data as MonthlySummary[]
    },
    enabled: !!user,
  })
}

export function useBudgets() {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select(`
          *,
          category:expense_categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BudgetUpdate }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:expense_categories(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useTodayExpenses() {
  const { user } = useAuth()
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['today-expenses', user?.id, today],
    queryFn: async () => {
      if (!user) return { total: 0, count: 0 }

      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('expense_date', today)

      if (error) throw error

      const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0)
      return { total, count: data.length }
    },
    enabled: !!user,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
    },
  })
}
