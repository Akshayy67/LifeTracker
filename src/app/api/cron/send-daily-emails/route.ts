import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, getMotivationalQuote, calculate1PercentImprovement } from '@/lib/email'
import { generateMotivationalMessage, DailySummary } from '@/lib/ai'
import { generateEODEmailHTML, generateMorningEmailHTML } from '@/lib/email-templates'
import { analyzeExpenses, generateExpenseEmailHTML } from '@/lib/expense-ai'
import { differenceInDays, format } from 'date-fns'

// This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
// Verify the request is from an authorized source
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  const cronSecret = process.env.CRON_SECRET
  const isLocalDev = process.env.NODE_ENV !== 'production'
  const isVercelCron = vercelCronHeader === '1'
  const isSecretAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isLocalDev && !isVercelCron && !isSecretAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'morning' or 'eod'
    const force = searchParams.get('force') === '1'

    if (!type || !['morning', 'eod'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // Fetch all users with email notifications enabled
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_notifications_enabled', true)
      .eq(type === 'morning' ? 'morning_email_enabled' : 'eod_email_enabled', true)

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
    }

    // Process each user
    for (const profile of profiles || []) {
      try {
        // Check if it's the right hour for this user (based on their timezone)
        const currentTime = new Date()
        const timezone = profile.timezone || 'UTC'
        const userTime = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }))
        const targetTime = type === 'morning' ? profile.morning_email_time : profile.eod_email_time
        
        // Parse time (HH:MM:SS format)
        const [hours] = targetTime.split(':').map(Number)
        
        // Run only during the target local hour to avoid duplicate sends
        if (!force && userTime.getHours() !== hours) {
          results.skipped++
          continue
        }

        // Fetch daily summary for this user
        const { data: habits } = await supabase
          .from('habits')
          .select('id, name')
          .eq('user_id', profile.id)
          .eq('active', true)

        const today = format(userTime, 'yyyy-MM-dd')
        const { data: completions } = await supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', profile.id)
          .eq('completion_date', today)

        const { data: journalEntries } = await supabase
          .from('journal_entries')
          .select('id')
          .eq('user_id', profile.id)
          .gte('created_at', today)

        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', profile.id)
          .gte('date', today)

        // Calculate streaks
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

        const summary: DailySummary = {
          habitsCompleted: new Set((completions || []).map(c => c.habit_id)).size,
          totalHabits: habits?.length || 0,
          journalEntries: journalEntries?.length || 0,
          expensesTracked: expenses?.length || 0,
          totalExpenses: (expenses || []).reduce((sum, exp) => sum + exp.amount, 0),
          streaks: streaks.filter(s => s.streak > 0).sort((a, b) => b.streak - a.streak),
        }

        // Fetch reminders
        const dayOfWeek = userTime.getDay()
        const { data: reminders } = await supabase
          .from('personal_reminders')
          .select('title, description')
          .eq('user_id', profile.id)
          .eq('is_active', true)
          .contains('days_of_week', [dayOfWeek])

        // Generate content
        const quote = profile.motivational_quotes_enabled ? getMotivationalQuote() : { quote: '', author: '' }
        const daysSinceStart = differenceInDays(new Date(), new Date(profile.created_at))
        const onePercentMessage = calculate1PercentImprovement(daysSinceStart)
        
        let aiMessage = ''
        if (profile.ai_personalization_enabled) {
          aiMessage = await generateMotivationalMessage(
            profile.full_name || profile.email,
            summary,
            type === 'eod'
          )
        }

        // Generate email HTML
        const html = type === 'eod'
          ? generateEODEmailHTML(
              profile.full_name || profile.email,
              summary,
              aiMessage,
              quote,
              onePercentMessage,
              reminders || []
            )
          : generateMorningEmailHTML(
              profile.full_name || profile.email,
              aiMessage,
              quote,
              onePercentMessage,
              reminders || []
            )

        const subject = type === 'eod' 
          ? `Your Day in Review - ${new Date().toLocaleDateString()}`
          : `Good Morning! Start Your Day Strong`

        const result = await sendEmail({
          to: profile.email,
          subject,
          html,
        })

        if (result.success) {
          results.sent++
        } else {
          results.failed++
          console.error(`Failed to send email to ${profile.email}:`, result.error)
        }
      } catch (error) {
        results.failed++
        console.error(`Error processing user ${profile.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      type,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
