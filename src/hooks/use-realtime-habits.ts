'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'

export function useRealtimeHabits() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Subscribe to habit completions
    const completionsChannel = supabase
      .channel('habit_completions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Habit completion change:', payload)
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['today-completions'] })
          queryClient.invalidateQueries({ queryKey: ['habit-completions'] })
          queryClient.invalidateQueries({ queryKey: ['habit-streak'] })
        }
      )
      .subscribe()

    // Subscribe to habits table
    const habitsChannel = supabase
      .channel('habits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Habit change:', payload)
          
          // Invalidate habits queries
          queryClient.invalidateQueries({ queryKey: ['habits'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(completionsChannel)
      supabase.removeChannel(habitsChannel)
    }
  }, [user, queryClient, supabase])
}

export function useRealtimeJournal() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('journal_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Journal change:', payload)
          queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
          queryClient.invalidateQueries({ queryKey: ['journal-entry'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient, supabase])
}

export function useRealtimeExpenses() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('expenses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Expense change:', payload)
          queryClient.invalidateQueries({ queryKey: ['expenses'] })
          queryClient.invalidateQueries({ queryKey: ['today-expenses'] })
          queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient, supabase])
}
