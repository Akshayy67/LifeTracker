import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { 
  Goal, 
  GoalInsert, 
  GoalUpdate, 
  GoalMilestone, 
  GoalMilestoneInsert,
  GoalProgressLog,
  GoalProgressLogInsert,
  GoalHabitInsert,
  GoalWithDetails
} from '@/types/goals'

export function useGoals() {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Goal[]
    },
    enabled: !!user,
  })
}

export function useGoal(goalId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      if (!goalId) return null

      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          milestones:goal_milestones(*),
          progress_logs:goal_progress_logs(*),
          connected_habits:goal_habits(*, habits(*))
        `)
        .eq('id', goalId)
        .single()

      if (error) throw error
      
      // Calculate completion percentage
      const goal = data as any
      let completion_percentage = 0
      
      if (goal.is_measurable && goal.target_value && goal.current_value !== null) {
        completion_percentage = Math.min(100, (goal.current_value / goal.target_value) * 100)
      } else if (goal.milestones && goal.milestones.length > 0) {
        const completed = goal.milestones.filter((m: any) => m.completed).length
        completion_percentage = (completed / goal.milestones.length) * 100
      }

      return { ...goal, completion_percentage } as GoalWithDetails
    },
    enabled: !!goalId,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (goal: GoalInsert) => {
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single()

      if (error) throw error
      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GoalUpdate }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Goal
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (milestone: GoalMilestoneInsert) => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .insert(milestone)
        .select()
        .single()

      if (error) throw error
      return data as GoalMilestone
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal', data.goal_id] })
    },
  })
}

export function useToggleMilestone() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, goalId, completed }: { id: string; goalId: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .update({ 
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as GoalMilestone
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId] })
    },
  })
}

export function useLogProgress() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (log: GoalProgressLogInsert) => {
      const { data, error } = await supabase
        .from('goal_progress_logs')
        .insert(log)
        .select()
        .single()

      if (error) throw error

      // Also update the goal's current_value
      await supabase
        .from('goals')
        .update({ current_value: log.value })
        .eq('id', log.goal_id)

      return data as GoalProgressLog
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal', data.goal_id] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useConnectHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (connection: GoalHabitInsert) => {
      const { data, error } = await supabase
        .from('goal_habits')
        .insert(connection)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goal_id] })
    },
  })
}

export function useDisconnectHabit() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ goalId, habitId }: { goalId: string; habitId: string }) => {
      const { error } = await supabase
        .from('goal_habits')
        .delete()
        .eq('goal_id', goalId)
        .eq('habit_id', habitId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId] })
    },
  })
}

export function useAssessGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      const response = await fetch(`/api/goals/${goalId}/assess`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to assess goal')
      }

      return response.json()
    },
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
