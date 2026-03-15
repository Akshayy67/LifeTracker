'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { Habit, HabitInsert, HabitUpdate, HabitCompletion } from '@/types/habits'
import { format } from 'date-fns'

export function useHabits() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: habits, isLoading: queryLoading } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Habit[]
    },
    enabled: !!user,
  })

  const isLoading = authLoading || queryLoading

  const createHabit = useMutation({
    mutationFn: async (habit: HabitInsert) => {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  const updateHabit = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HabitUpdate }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date?: Date }) => {
      const completionDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

      // Check if already completed
      const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completion_date', completionDate)
        .single()

      if (existing) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id)

        if (error) throw error
        return { action: 'removed', habitId, date: completionDate }
      } else {
        // Add completion
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user!.id,
            completion_date: completionDate,
          })

        if (error) throw error
        return { action: 'added', habitId, date: completionDate }
      }
    },
    onMutate: async ({ habitId, date }) => {
      const completionDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habit-completions', habitId] })
      await queryClient.cancelQueries({ queryKey: ['today-completions'] })

      // Snapshot previous value
      const previousCompletions = queryClient.getQueryData(['habit-completions', habitId])

      // Optimistically update
      queryClient.setQueryData(['habit-completions', habitId], (old: any) => {
        if (!old) return old
        const exists = old.some((c: any) => c.completion_date === completionDate)
        if (exists) {
          return old.filter((c: any) => c.completion_date !== completionDate)
        } else {
          return [...old, { habit_id: habitId, completion_date: completionDate }]
        }
      })

      return { previousCompletions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        queryClient.setQueryData(['habit-completions', variables.habitId], context.previousCompletions)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions', data.habitId] })
      queryClient.invalidateQueries({ queryKey: ['today-completions'] })
      queryClient.invalidateQueries({ queryKey: ['habit-streak', data.habitId] })
    },
  })

  return {
    habits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  }
}

export function useHabitCompletions(habitId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['habit-completions', habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .order('completion_date', { ascending: false })

      if (error) throw error
      return data as HabitCompletion[]
    },
    enabled: !!habitId,
  })
}

export function useHabitStreak(habitId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['habit-streak', habitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calculate_streak', {
        p_habit_id: habitId,
      })

      if (error) throw error
      return data as number
    },
    enabled: !!habitId,
  })
}

export function useTodayCompletions() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const query = useQuery({
    queryKey: ['today-completions', user?.id, today],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('completion_date', today)

      if (error) throw error
      return data.map(c => c.habit_id)
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}
