import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, getMotivationalQuote, calculate1PercentImprovement } from '@/lib/email'
import { generateMotivationalMessage, DailySummary } from '@/lib/ai'
import { generateEODEmailHTML, generateMorningEmailHTML } from '@/lib/email-templates'
import { generateGoalEmailInsights } from '@/lib/goal-ai'
import { differenceInDays } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json() // 'eod' or 'morning'

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Allow test emails even if notifications are disabled
    console.log('Sending email to:', profile.email)
    console.log('Email type:', type)

    // Fetch daily summary
    let summary: DailySummary
    try {
      const summaryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/daily-summary`,
        {
          headers: {
            Cookie: request.headers.get('cookie') || '',
          },
        }
      )
      
      if (!summaryResponse.ok) {
        console.error('Failed to fetch daily summary:', await summaryResponse.text())
        // Use default summary if fetch fails
        summary = {
          habitsCompleted: 0,
          totalHabits: 0,
          journalEntries: 0,
          expensesTracked: 0,
          totalExpenses: 0,
          streaks: [],
        }
      } else {
        summary = await summaryResponse.json()
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error)
      summary = {
        habitsCompleted: 0,
        totalHabits: 0,
        journalEntries: 0,
        expensesTracked: 0,
        totalExpenses: 0,
        streaks: [],
      }
    }

    // Fetch active reminders for today
    const today = new Date().getDay()
    const { data: reminders } = await supabase
      .from('personal_reminders')
      .select('title, description')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .contains('days_of_week', [today])

    // Calculate days since account creation for 1% message
    const daysSinceStart = differenceInDays(new Date(), new Date(profile.created_at))

    // Generate content
    const quote = profile.motivational_quotes_enabled ? getMotivationalQuote() : { quote: '', author: '' }
    const onePercentMessage = calculate1PercentImprovement(daysSinceStart)
    
    let aiMessage = ''
    if (profile.ai_personalization_enabled) {
      aiMessage = await generateMotivationalMessage(
        profile.full_name || profile.email,
        summary,
        type === 'eod'
      )
    }

    // Generate goal insights if enabled
    let goalInsights = ''
    if (profile.goal_email_insights_enabled) {
      try {
        goalInsights = await generateGoalEmailInsights(user.id)
      } catch (error) {
        console.error('Error generating goal insights:', error)
      }
    }

    // Generate expense analysis
    let expenseHTML = ''
    try {
      const expenseAnalysis = await analyzeExpenses(user.id)
      expenseHTML = generateExpenseEmailHTML(expenseAnalysis)
    } catch (error) {
      console.error('Error generating expense analysis:', error)
    }

    // Generate email HTML
    const html = type === 'eod'
      ? generateEODEmailHTML(
          profile.full_name || profile.email,
          summary,
          aiMessage,
          quote,
          onePercentMessage,
          reminders || [],
          goalInsights,
          expenseHTML
        )
      : generateMorningEmailHTML(
          profile.full_name || profile.email,
          aiMessage,
          quote,
          onePercentMessage,
          reminders || [],
          undefined,
          goalInsights,
          expenseHTML
        )

    // Send email
    const subject = type === 'eod' 
      ? `Your Day in Review - ${new Date().toLocaleDateString()}`
      : `Good Morning! Start Your Day Strong`

    console.log('Attempting to send email...')
    console.log('Subject:', subject)
    console.log('To:', profile.email)

    const result = await sendEmail({
      to: profile.email,
      subject,
      html,
    })

    console.log('Email send result:', result)

    if (!result.success) {
      console.error('Email send failed:', result.error)
      return NextResponse.json({ 
        success: false,
        error: result.error || 'Failed to send email. Check server logs for details.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: result.data 
    })
  } catch (error) {
    console.error('Error sending email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: String(error)
    }, { status: 500 })
  }
}
