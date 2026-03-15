import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildLifeReviewContext } from '@/lib/life-review-context'
import { generateLifeReview } from '@/lib/life-review-ai'
import { sendLifeReviewEmail } from '@/lib/life-review-email'
import { format } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { journalId } = body

    if (!journalId) {
      return NextResponse.json({ error: 'Missing journalId' }, { status: 400 })
    }

    // Verify journal belongs to user
    const { data: journal, error: journalError } = await supabase
      .from('journal_entries')
      .select('id, created_at')
      .eq('id', journalId)
      .eq('user_id', user.id)
      .single()

    if (journalError || !journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, ai_review_enabled')
      .eq('id', user.id)
      .single()

    if (!profile?.ai_review_enabled) {
      return NextResponse.json({ error: 'AI reviews not enabled' }, { status: 403 })
    }

    console.log('Building life review context...')
    
    // Step 1: Build comprehensive context
    const context = await buildLifeReviewContext(user.id, journalId)

    console.log('Generating AI review...')
    
    // Step 2: Generate AI review
    const reviewText = await generateLifeReview(context)

    console.log('Saving review to database...')
    
    // Step 3: Save review to database
    const { data: savedReview, error: saveError } = await supabase
      .from('ai_reviews')
      .insert({
        user_id: user.id,
        journal_id: journalId,
        review_text: reviewText,
        review_data: {
          context: {
            habitScore: context.analytics.habitConsistencyScore,
            spendingScore: context.analytics.spendingScore,
            moodTrend: context.historicalBehavior.moodTrend,
          },
          generatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving review:', saveError)
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    console.log('Sending email...')
    
    // Step 4: Send email
    const emailDate = format(new Date(journal.created_at), 'MMMM d, yyyy')
    const emailResult = await sendLifeReviewEmail(
      profile.email,
      profile.full_name || profile.email,
      reviewText,
      emailDate
    )

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
      // Don't fail the request if email fails
    }

    console.log('Life review complete!')

    return NextResponse.json({
      success: true,
      reviewId: savedReview.id,
      emailSent: emailResult.success,
      review: reviewText,
    })
  } catch (error) {
    console.error('Life review error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
