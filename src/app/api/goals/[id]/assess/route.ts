import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assessGoalProgress } from '@/lib/goal-ai'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goalId = params.id

    // Verify goal belongs to user
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Run AI assessment
    const assessment = await assessGoalProgress(goalId, user.id)

    // Update goal with assessment
    const { error: updateError } = await supabase
      .from('goals')
      .update({
        ai_assessment: assessment,
        last_assessment_at: new Date().toISOString(),
      })
      .eq('id', goalId)

    if (updateError) {
      console.error('Error updating goal assessment:', updateError)
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, assessment })
  } catch (error) {
    console.error('Error assessing goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
