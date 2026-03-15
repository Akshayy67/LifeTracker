import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { habitId, date } = body

    if (!habitId) {
      return NextResponse.json({ error: 'Missing habitId' }, { status: 400 })
    }

    const completionDate = date || format(new Date(), 'yyyy-MM-dd')

    // Check if already completed
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('completion_date', completionDate)
      .single()

    if (existing) {
      return NextResponse.json({ 
        completionId: existing.id,
        alreadyExists: true 
      })
    }

    // Create completion
    const { data: completion, error } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        completion_date: completionDate,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating completion:', error)
      return NextResponse.json({ error: 'Failed to create completion' }, { status: 500 })
    }

    return NextResponse.json({ 
      completionId: completion.id,
      alreadyExists: false 
    })
  } catch (error) {
    console.error('Completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { completionId } = body

    if (!completionId) {
      return NextResponse.json({ error: 'Missing completionId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('id', completionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting completion:', error)
      return NextResponse.json({ error: 'Failed to delete completion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
