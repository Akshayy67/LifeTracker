import { Database } from './database.types'

export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitInsert = Database['public']['Tables']['habits']['Insert']
export type HabitUpdate = Database['public']['Tables']['habits']['Update']

export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type HabitCompletionInsert = Database['public']['Tables']['habit_completions']['Insert']

export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export interface HabitWithStreak extends Habit {
  streak: number
  completions_count?: number
  last_completed?: string | null
}

export interface HabitCompletionData {
  date: string
  count: number
  completed: boolean
}

export interface HabitStats {
  total_completions: number
  current_streak: number
  longest_streak: number
  completion_rate: number
}
