export type GoalCategory = 'health' | 'career' | 'financial' | 'personal' | 'learning' | 'relationships' | 'other'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned'
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical'
export type AssessmentFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface AIAssessment {
  overall_progress: number // 0-100
  trajectory: 'on_track' | 'ahead' | 'behind' | 'stalled'
  insights: string[]
  recommendations: string[]
  habit_alignment: {
    habit_id: string
    habit_name: string
    contribution_score: number // 0-100
    consistency: number // 0-100
  }[]
  blockers: string[]
  wins: string[]
  next_steps: string[]
  assessed_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: GoalCategory
  target_date: string | null
  status: GoalStatus
  priority: GoalPriority
  is_measurable: boolean
  current_value: number | null
  target_value: number | null
  unit: string | null
  ai_assessment: AIAssessment | null
  last_assessment_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface GoalInsert {
  user_id: string
  title: string
  description?: string | null
  category: GoalCategory
  target_date?: string | null
  status?: GoalStatus
  priority?: GoalPriority
  is_measurable?: boolean
  current_value?: number | null
  target_value?: number | null
  unit?: string | null
}

export interface GoalUpdate {
  title?: string
  description?: string | null
  category?: GoalCategory
  target_date?: string | null
  status?: GoalStatus
  priority?: GoalPriority
  is_measurable?: boolean
  current_value?: number | null
  target_value?: number | null
  unit?: string | null
  ai_assessment?: AIAssessment | null
  last_assessment_at?: string | null
  completed_at?: string | null
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  description: string | null
  target_date: string | null
  completed: boolean
  completed_at: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface GoalMilestoneInsert {
  goal_id: string
  title: string
  description?: string | null
  target_date?: string | null
  display_order?: number
}

export interface GoalProgressLog {
  id: string
  goal_id: string
  value: number
  note: string | null
  logged_at: string
  created_at: string
}

export interface GoalProgressLogInsert {
  goal_id: string
  value: number
  note?: string | null
  logged_at?: string
}

export interface GoalHabit {
  id: string
  goal_id: string
  habit_id: string
  contribution_weight: number
  created_at: string
}

export interface GoalHabitInsert {
  goal_id: string
  habit_id: string
  contribution_weight?: number
}

export interface GoalWithDetails extends Goal {
  milestones?: GoalMilestone[]
  progress_logs?: GoalProgressLog[]
  connected_habits?: (GoalHabit & { habit_name: string })[]
  completion_percentage?: number
}
