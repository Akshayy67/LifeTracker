import { createAdminClient } from './supabase/admin'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { captionMultipleImages } from './image-caption-ai'

export interface LifeReviewContext {
  journalEntry: {
    date: string
    text: string
    mood: string | null
    tags: string[]
    imageDescriptions: string[]
  }
  habits: {
    name: string
    frequency: string
    completedLast7Days: number
    completedLast30Days: number
    streak: number
    missedDays: number
  }[]
  expenses: {
    todayTotal: number
    categoryBreakdown: {
      category: string
      amount: number
      budgetLimit: number | null
      overBudget: boolean
    }[]
    monthlyTotal: number
    totalBudget: number
    overspendingCategories: string[]
  }
  analytics: {
    habitConsistencyScore: number
    spendingScore: number
    weeklyTrends: {
      habitCompletion: number[]
      dailySpending: number[]
      moodPattern: string[]
    }
  }
  goals: {
    ultimateGoal: string | null
    weeklyGoal: string | null
  }
  historicalBehavior: {
    journalTrend: string
    habitTrend: string
    spendingTrend: string
    moodTrend: string
  }
}

export async function buildLifeReviewContext(
  userId: string,
  journalId: string
): Promise<LifeReviewContext> {
  console.log('Building life review context for user:', userId)
  const supabase = createAdminClient()

  // 1. Fetch journal entry with images
  const { data: journal } = await supabase
    .from('journal_entries')
    .select('*, journal_images(storage_path)')
    .eq('id', journalId)
    .single()

  if (!journal) throw new Error('Journal not found')

  const journalDate = new Date(journal.created_at)
  const today = format(journalDate, 'yyyy-MM-dd')

  // Caption images
  let imageDescriptions: string[] = []
  if (journal.journal_images && journal.journal_images.length > 0) {
    const imageUrls = journal.journal_images.map((img: any) => {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/journal-images/${img.storage_path}`
    })
    imageDescriptions = await captionMultipleImages(imageUrls)
  }

  // 2. Fetch habits data
  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, frequency')
    .eq('user_id', userId)
    .eq('active', true)

  const habitData = await Promise.all(
    (habits || []).map(async (habit) => {
      // Last 7 days completions
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
      const { data: last7 } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habit.id)
        .gte('completion_date', sevenDaysAgo)

      // Last 30 days completions
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const { data: last30 } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habit.id)
        .gte('completion_date', thirtyDaysAgo)

      // Streak
      const { data: streak } = await supabase.rpc('calculate_streak', {
        p_habit_id: habit.id,
      })

      return {
        name: habit.name,
        frequency: habit.frequency || 'daily',
        completedLast7Days: last7?.length || 0,
        completedLast30Days: last30?.length || 0,
        streak: streak || 0,
        missedDays: 7 - (last7?.length || 0),
      }
    })
  )

  // 3. Fetch expense data
  const { data: todayExpenses } = await supabase
    .from('expenses')
    .select('amount, category_id, expense_categories(name)')
    .eq('user_id', userId)
    .eq('date', today)

  const todayTotal = (todayExpenses || []).reduce((sum, exp) => sum + exp.amount, 0)

  // Monthly expenses by category
  const monthStart = format(new Date(journalDate.getFullYear(), journalDate.getMonth(), 1), 'yyyy-MM-dd')
  const monthEnd = format(new Date(journalDate.getFullYear(), journalDate.getMonth() + 1, 0), 'yyyy-MM-dd')

  const { data: monthlyExpenses } = await supabase
    .from('expenses')
    .select('amount, category_id, expense_categories(name)')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  const monthlyTotal = (monthlyExpenses || []).reduce((sum, exp) => sum + exp.amount, 0)

  // Category breakdown with budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('active', true)

  const categoryMap = new Map<string, { amount: number; budget: number | null }>()
  for (const exp of monthlyExpenses || []) {
    const catName = exp.expense_categories?.name || 'Uncategorized'
    const budget = budgets?.find(b => b.category_id === exp.category_id)
    
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { amount: 0, budget: budget?.amount || null })
    }
    categoryMap.get(catName)!.amount += exp.amount
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    budgetLimit: data.budget,
    overBudget: data.budget ? data.amount > data.budget : false,
  }))

  const totalBudget = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0
  const overspendingCategories = categoryBreakdown
    .filter(c => c.overBudget)
    .map(c => c.category)

  // 4. Analytics
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))

  // Habit completion trend
  const habitCompletionTrend = await Promise.all(
    last7Days.map(async (date) => {
      const { data } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('completion_date', date)
      return data?.length || 0
    })
  )

  // Daily spending trend
  const spendingTrend = await Promise.all(
    last7Days.map(async (date) => {
      const { data } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('date', date)
      return data?.reduce((sum, exp) => sum + exp.amount, 0) || 0
    })
  )

  // Mood trend
  const { data: moodData } = await supabase
    .from('journal_entries')
    .select('mood')
    .eq('user_id', userId)
    .gte('created_at', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
    .order('created_at', { ascending: true })

  const moodPattern = (moodData || []).map(m => m.mood || 'neutral')

  // Calculate scores
  const totalHabits = habits?.length || 1
  const avgCompletionRate = habitCompletionTrend.reduce((a, b) => a + b, 0) / (7 * totalHabits)
  const habitConsistencyScore = Math.round(avgCompletionRate * 100)

  const avgSpending = spendingTrend.reduce((a, b) => a + b, 0) / 7
  const spendingScore = totalBudget > 0 
    ? Math.max(0, 100 - Math.round((monthlyTotal / totalBudget) * 100))
    : 50

  // 5. User goals
  const { data: profile } = await supabase
    .from('profiles')
    .select('ultimate_goal, weekly_goal')
    .eq('id', userId)
    .single()

  // 6. Historical behavior analysis
  const journalTrend = analyzeJournalTrend(moodPattern)
  const habitTrend = analyzeHabitTrend(habitCompletionTrend)
  const spendingTrendAnalysis = analyzeSpendingTrend(spendingTrend)
  const moodTrend = analyzeMoodTrend(moodPattern)

  return {
    journalEntry: {
      date: format(journalDate, 'MMMM d, yyyy'),
      text: journal.content || '',
      mood: journal.mood,
      tags: journal.tags || [],
      imageDescriptions,
    },
    habits: habitData,
    expenses: {
      todayTotal,
      categoryBreakdown,
      monthlyTotal,
      totalBudget,
      overspendingCategories,
    },
    analytics: {
      habitConsistencyScore,
      spendingScore,
      weeklyTrends: {
        habitCompletion: habitCompletionTrend,
        dailySpending: spendingTrend,
        moodPattern,
      },
    },
    goals: {
      ultimateGoal: profile?.ultimate_goal || null,
      weeklyGoal: profile?.weekly_goal || null,
    },
    historicalBehavior: {
      journalTrend,
      habitTrend,
      spendingTrend: spendingTrendAnalysis,
      moodTrend,
    },
  }
}

function analyzeJournalTrend(moodPattern: string[]): string {
  if (moodPattern.length === 0) return 'No recent journal entries'
  
  const positive = moodPattern.filter(m => ['happy', 'excited', 'grateful'].includes(m)).length
  const negative = moodPattern.filter(m => ['sad', 'anxious', 'stressed', 'angry'].includes(m)).length
  
  if (positive > negative * 2) return 'Consistently positive mood in recent entries'
  if (negative > positive * 2) return 'Concerning negative mood pattern detected'
  return 'Mixed emotional state in recent entries'
}

function analyzeHabitTrend(completions: number[]): string {
  if (completions.length < 2) return 'Insufficient data'
  
  const recent = completions.slice(-3).reduce((a, b) => a + b, 0) / 3
  const earlier = completions.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  
  if (recent > earlier * 1.2) return 'Improving habit discipline'
  if (recent < earlier * 0.8) return 'Declining habit consistency'
  return 'Stable habit pattern'
}

function analyzeSpendingTrend(spending: number[]): string {
  if (spending.length < 2) return 'Insufficient data'
  
  const recent = spending.slice(-3).reduce((a, b) => a + b, 0) / 3
  const earlier = spending.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  
  if (recent > earlier * 1.3) return 'Spending increasing significantly'
  if (recent < earlier * 0.7) return 'Spending decreasing (good control)'
  return 'Stable spending pattern'
}

function analyzeMoodTrend(moodPattern: string[]): string {
  if (moodPattern.length === 0) return 'No mood data'
  
  const recentMoods = moodPattern.slice(-3)
  const positive = recentMoods.filter(m => ['happy', 'excited', 'grateful'].includes(m)).length
  
  if (positive >= 2) return 'Recent positive emotional state'
  if (positive === 0) return 'Recent emotional struggles detected'
  return 'Fluctuating emotional state'
}
