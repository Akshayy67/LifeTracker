import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    
    const dayStart = format(startOfDay(targetDate), 'yyyy-MM-dd')
    const dayEnd = format(endOfDay(targetDate), 'yyyy-MM-dd HH:mm:ss')

    // Fetch habits
    const { data: habits } = await supabase
      .from('habits')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('active', true)

    // Fetch habit completions for the day
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('habit_id')
      .eq('user_id', user.id)
      .gte('completion_date', dayStart)
      .lte('completion_date', dayEnd)

    // Fetch journal entries for the day
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)

    // Fetch expenses for the day
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', dayStart)
      .lte('date', dayEnd)

    // Calculate streaks for each habit
    const streaks = await Promise.all(
      (habits || []).map(async (habit) => {
        const { data: streakData } = await supabase
          .rpc('calculate_streak', { p_habit_id: habit.id })
        
        return {
          habitName: habit.name,
          streak: streakData || 0,
        }
      })
    )

    const totalExpenses = (expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
    const completedHabitIds = new Set((completions || []).map(c => c.habit_id))

    return NextResponse.json({
      habitsCompleted: completedHabitIds.size,
      totalHabits: habits?.length || 0,
      journalEntries: journalEntries?.length || 0,
      expensesTracked: expenses?.length || 0,
      totalExpenses,
      streaks: streaks.filter(s => s.streak > 0).sort((a, b) => b.streak - a.streak),
    })
  } catch (error) {
    console.error('Error fetching daily summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
