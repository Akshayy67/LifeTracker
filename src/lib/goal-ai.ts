import OpenAI from 'openai'
import { Goal, GoalWithDetails, AIAssessment } from '@/types/goals'
import { createAdminClient } from './supabase/admin'
import { differenceInDays, format } from 'date-fns'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

interface GoalAnalysisContext {
  goal: GoalWithDetails
  recentHabitCompletions: {
    habit_id: string
    habit_name: string
    completions_last_7_days: number
    completions_last_30_days: number
    current_streak: number
  }[]
  recentJournalEntries: {
    date: string
    content_snippet: string
  }[]
  progressTrend: {
    date: string
    value: number
  }[]
  daysElapsed: number
  daysRemaining: number | null
}

export async function assessGoalProgress(
  goalId: string,
  userId: string
): Promise<AIAssessment> {
  const supabase = createAdminClient()

  // Fetch goal with all related data
  const { data: goal } = await supabase
    .from('goals')
    .select(`
      *,
      milestones:goal_milestones(*),
      progress_logs:goal_progress_logs(*)
    `)
    .eq('id', goalId)
    .single()

  if (!goal) {
    throw new Error('Goal not found')
  }

  // Fetch connected habits and their performance
  const { data: goalHabits } = await supabase
    .from('goal_habits')
    .select('habit_id, contribution_weight, habits(id, name)')
    .eq('goal_id', goalId)

  const habitAnalysis = await Promise.all(
    (goalHabits || []).map(async (gh: any) => {
      const habitId = gh.habit_id
      const habitName = gh.habits?.name || 'Unknown'

      // Last 7 days completions
      const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      const { count: last7Days } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('habit_id', habitId)
        .gte('completion_date', sevenDaysAgo)

      // Last 30 days completions
      const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      const { count: last30Days } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('habit_id', habitId)
        .gte('completion_date', thirtyDaysAgo)

      // Current streak
      const { data: streak } = await supabase
        .rpc('calculate_streak', { p_habit_id: habitId })

      return {
        habit_id: habitId,
        habit_name: habitName,
        completions_last_7_days: last7Days || 0,
        completions_last_30_days: last30Days || 0,
        current_streak: streak || 0,
      }
    })
  )

  // Fetch recent journal entries
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('created_at, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const recentJournalEntries = (journalEntries || []).map((entry: any) => ({
    date: entry.created_at,
    content_snippet: entry.content?.substring(0, 200) || '',
  }))

  // Calculate progress trend
  const progressLogs = (goal.progress_logs || [])
    .sort((a: any, b: any) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .slice(-10)
    .map((log: any) => ({
      date: log.logged_at,
      value: log.value,
    }))

  const daysElapsed = differenceInDays(new Date(), new Date(goal.created_at))
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null

  const context: GoalAnalysisContext = {
    goal,
    recentHabitCompletions: habitAnalysis,
    recentJournalEntries,
    progressTrend: progressLogs,
    daysElapsed,
    daysRemaining,
  }

  // Use AI or fallback to rule-based assessment
  if (openai) {
    return await generateAIAssessment(context)
  } else if (process.env.GEMINI_API_KEY) {
    return await generateGeminiAssessment(context)
  } else {
    return generateRuleBasedAssessment(context)
  }
}

async function generateAIAssessment(context: GoalAnalysisContext): Promise<AIAssessment> {
  if (!openai) throw new Error('OpenAI not configured')

  const prompt = buildAssessmentPrompt(context)

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert life coach and goal achievement advisor. Analyze the user\'s goal progress data and provide actionable, motivating insights. Be honest but encouraging. Focus on patterns, trends, and specific recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    
    return {
      overall_progress: response.overall_progress || 0,
      trajectory: response.trajectory || 'on_track',
      insights: response.insights || [],
      recommendations: response.recommendations || [],
      habit_alignment: response.habit_alignment || [],
      blockers: response.blockers || [],
      wins: response.wins || [],
      next_steps: response.next_steps || [],
      assessed_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('AI assessment error:', error)
    return generateRuleBasedAssessment(context)
  }
}

async function generateGeminiAssessment(context: GoalAnalysisContext): Promise<AIAssessment> {
  const prompt = buildAssessmentPrompt(context)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt + '\n\nRespond with valid JSON only.' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}')

    return {
      overall_progress: parsed.overall_progress || 0,
      trajectory: parsed.trajectory || 'on_track',
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      habit_alignment: parsed.habit_alignment || [],
      blockers: parsed.blockers || [],
      wins: parsed.wins || [],
      next_steps: parsed.next_steps || [],
      assessed_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Gemini assessment error:', error)
    return generateRuleBasedAssessment(context)
  }
}

function buildAssessmentPrompt(context: GoalAnalysisContext): string {
  const { goal, recentHabitCompletions, progressTrend, daysElapsed, daysRemaining } = context

  return `Analyze this goal and provide a comprehensive assessment in JSON format:

GOAL DETAILS:
- Title: ${goal.title}
- Description: ${goal.description || 'None'}
- Category: ${goal.category}
- Priority: ${goal.priority}
- Created: ${daysElapsed} days ago
- Target Date: ${daysRemaining !== null ? `${daysRemaining} days remaining` : 'No deadline'}
${goal.is_measurable ? `- Progress: ${goal.current_value || 0} / ${goal.target_value} ${goal.unit}` : ''}

CONNECTED HABITS:
${recentHabitCompletions.map(h => `- ${h.habit_name}: ${h.completions_last_7_days}/7 days completed, ${h.current_streak} day streak`).join('\n')}

PROGRESS TREND:
${progressTrend.length > 0 ? progressTrend.map(p => `${p.date}: ${p.value}`).join('\n') : 'No progress logs yet'}

MILESTONES:
${(goal.milestones || []).map((m: any) => `- ${m.title} (${m.completed ? 'Completed' : 'Pending'})`).join('\n')}

Provide assessment as JSON with these fields:
{
  "overall_progress": <0-100 number>,
  "trajectory": "<on_track|ahead|behind|stalled>",
  "insights": ["<key observation 1>", "<key observation 2>"],
  "recommendations": ["<actionable advice 1>", "<actionable advice 2>"],
  "habit_alignment": [{"habit_id": "<id>", "habit_name": "<name>", "contribution_score": <0-100>, "consistency": <0-100>}],
  "blockers": ["<potential obstacle 1>"],
  "wins": ["<recent achievement 1>"],
  "next_steps": ["<specific action 1>", "<specific action 2>"]
}`
}

function generateRuleBasedAssessment(context: GoalAnalysisContext): AIAssessment {
  const { goal, recentHabitCompletions, progressTrend, daysElapsed, daysRemaining } = context

  // Calculate overall progress
  let overall_progress = 0
  if (goal.is_measurable && goal.target_value && goal.current_value !== null) {
    overall_progress = Math.min(100, (goal.current_value / goal.target_value) * 100)
  } else if (goal.milestones && goal.milestones.length > 0) {
    const completed = goal.milestones.filter((m: any) => m.completed).length
    overall_progress = (completed / goal.milestones.length) * 100
  }

  // Determine trajectory
  let trajectory: 'on_track' | 'ahead' | 'behind' | 'stalled' = 'on_track'
  if (daysRemaining !== null && daysRemaining > 0) {
    const expectedProgress = ((daysElapsed / (daysElapsed + daysRemaining)) * 100)
    if (overall_progress > expectedProgress + 15) trajectory = 'ahead'
    else if (overall_progress < expectedProgress - 15) trajectory = 'behind'
  }
  if (progressTrend.length >= 3) {
    const recent = progressTrend.slice(-3)
    const isStalled = recent.every((p, i) => i === 0 || p.value === recent[i - 1].value)
    if (isStalled) trajectory = 'stalled'
  }

  // Generate insights
  const insights: string[] = []
  const habitConsistency = recentHabitCompletions.reduce((sum, h) => sum + h.completions_last_7_days, 0) / (recentHabitCompletions.length * 7) * 100
  if (habitConsistency > 80) {
    insights.push(`Excellent habit consistency at ${habitConsistency.toFixed(0)}% - your daily actions are aligned with this goal`)
  } else if (habitConsistency < 50) {
    insights.push(`Habit consistency is at ${habitConsistency.toFixed(0)}% - increasing daily actions could accelerate progress`)
  }

  if (trajectory === 'ahead') {
    insights.push('You\'re ahead of schedule! Your current pace is exceeding expectations')
  } else if (trajectory === 'behind') {
    insights.push('Progress is behind schedule - consider adjusting your approach or timeline')
  }

  // Generate recommendations
  const recommendations: string[] = []
  const weakHabits = recentHabitCompletions.filter(h => h.completions_last_7_days < 4)
  if (weakHabits.length > 0) {
    recommendations.push(`Focus on improving: ${weakHabits.map(h => h.habit_name).join(', ')}`)
  }
  if (daysRemaining !== null && daysRemaining < 30 && overall_progress < 70) {
    recommendations.push('With less than 30 days remaining, consider intensifying your efforts or adjusting the target')
  }

  // Habit alignment
  const habit_alignment = recentHabitCompletions.map(h => ({
    habit_id: h.habit_id,
    habit_name: h.habit_name,
    contribution_score: Math.min(100, (h.completions_last_30_days / 30) * 100),
    consistency: (h.completions_last_7_days / 7) * 100,
  }))

  return {
    overall_progress: Math.round(overall_progress),
    trajectory,
    insights,
    recommendations,
    habit_alignment,
    blockers: [],
    wins: recentHabitCompletions.filter(h => h.current_streak >= 7).map(h => `${h.habit_name}: ${h.current_streak} day streak!`),
    next_steps: recommendations.slice(0, 3),
    assessed_at: new Date().toISOString(),
  }
}

export async function generateGoalEmailInsights(userId: string): Promise<string> {
  const supabase = createAdminClient()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('priority', { ascending: false })
    .limit(3)

  if (!goals || goals.length === 0) {
    return ''
  }

  let insights = '<h3 style="color: #3b82f6; margin: 20px 0 12px 0;">🎯 Your Goals Progress</h3>'

  for (const goal of goals) {
    const assessment = goal.ai_assessment as AIAssessment | null
    if (!assessment) continue

    const trajectoryEmoji = {
      on_track: '✅',
      ahead: '🚀',
      behind: '⚠️',
      stalled: '⏸️',
    }[assessment.trajectory]

    insights += `
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 12px; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #1e293b;">${trajectoryEmoji} ${goal.title}</h4>
        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Progress: ${assessment.overall_progress}%</p>
        ${assessment.insights.length > 0 ? `<p style="margin: 0; color: #475569; font-size: 14px;"><strong>Insight:</strong> ${assessment.insights[0]}</p>` : ''}
        ${assessment.next_steps.length > 0 ? `<p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;"><strong>Next:</strong> ${assessment.next_steps[0]}</p>` : ''}
      </div>
    `
  }

  return insights
}
