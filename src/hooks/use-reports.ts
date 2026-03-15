'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns'

export function useHabitCompletionRate(days: number = 30) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['habit-completion-rate', user?.id, days],
    queryFn: async () => {
      if (!user) return []

      const endDate = startOfDay(new Date())
      const startDate = subDays(endDate, days - 1)

      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('frequency', 'daily')
        .eq('active', true)

      if (!habits || habits.length === 0) return []

      const { data: completions } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('user_id', user.id)
        .gte('completion_date', format(startDate, 'yyyy-MM-dd'))
        .lte('completion_date', format(endDate, 'yyyy-MM-dd'))

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
      const completionMap = new Map<string, number>()

      completions?.forEach(c => {
        const count = completionMap.get(c.completion_date) || 0
        completionMap.set(c.completion_date, count + 1)
      })

      return dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const completed = completionMap.get(dateStr) || 0
        const rate = habits.length > 0 ? (completed / habits.length) * 100 : 0

        return {
          date: format(date, 'MMM d'),
          rate: Math.round(rate),
          completed,
          total: habits.length,
        }
      })
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useExpenseBreakdown(days: number = 30) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['expense-breakdown', user?.id, days],
    queryFn: async () => {
      if (!user) return []

      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          amount,
          category:expense_categories(name, color)
        `)
        .eq('user_id', user.id)
        .gte('expense_date', startDate)

      if (!expenses) return []

      const categoryMap = new Map<string, { name: string; color: string; total: number }>()

      expenses.forEach((expense: any) => {
        if (!expense.category) return

        const existing = categoryMap.get(expense.category.name)
        if (existing) {
          existing.total += Number(expense.amount)
        } else {
          categoryMap.set(expense.category.name, {
            name: expense.category.name,
            color: expense.category.color,
            total: Number(expense.amount),
          })
        }
      })

      return Array.from(categoryMap.values()).map(cat => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
      }))
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useExpenseTrend(days: number = 30) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['expense-trend', user?.id, days],
    queryFn: async () => {
      if (!user) return []

      const endDate = startOfDay(new Date())
      const startDate = subDays(endDate, days - 1)

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', format(startDate, 'yyyy-MM-dd'))
        .lte('expense_date', format(endDate, 'yyyy-MM-dd'))

      if (!expenses) return []

      const dateMap = new Map<string, number>()
      expenses.forEach(expense => {
        const current = dateMap.get(expense.expense_date) || 0
        dateMap.set(expense.expense_date, current + Number(expense.amount))
      })

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
      return dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return {
          date: format(date, 'MMM d'),
          amount: dateMap.get(dateStr) || 0,
        }
      })
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useMoodTrend(days: number = 30) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['mood-trend', user?.id, days],
    queryFn: async () => {
      if (!user) return []

      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('entry_date, mood')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .not('mood', 'is', null)
        .order('entry_date', { ascending: true })

      if (!entries) return []

      const moodValues: Record<string, number> = {
        terrible: 1,
        bad: 2,
        okay: 3,
        good: 4,
        great: 5,
      }

      return entries.map(entry => ({
        date: format(new Date(entry.entry_date), 'MMM d'),
        mood: moodValues[entry.mood || 'okay'] || 3,
        moodLabel: entry.mood,
      }))
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useStreakLeaderboard() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['streak-leaderboard', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data: habits } = await supabase
        .from('habits')
        .select('id, name, color, frequency')
        .eq('user_id', user.id)
        .eq('active', true)

      if (!habits) return []

      const habitsWithStreaks = await Promise.all(
        habits.map(async (habit) => {
          const { data: streak } = await supabase.rpc('calculate_streak', {
            p_habit_id: habit.id,
          })

          return {
            ...habit,
            streak: streak || 0,
          }
        })
      )

      return habitsWithStreaks
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 10)
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useSummaryStats(days: number = 30) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['summary-stats', user?.id, days],
    queryFn: async () => {
      if (!user) return null

      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

      const { data: habitCompletions } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completion_date', startDate)

      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', startDate)

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

      const { data: activeHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)

      return {
        habitsCompleted: habitCompletions?.length || 0,
        journalEntries: journalEntries?.length || 0,
        totalExpenses,
        activeHabits: activeHabits?.length || 0,
        period: days,
      }
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}
