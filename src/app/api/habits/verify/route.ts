import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyHabitPhoto, generateVerificationPrompt } from '@/lib/habit-verification-ai'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { habitId, completionId, imageBase64 } = body

    if (!habitId || !completionId || !imageBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch habit details
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('name, description, verification_prompt, strict_mode')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

    if (habitError || !habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    if (!habit.strict_mode) {
      return NextResponse.json({ error: 'Habit is not in strict mode' }, { status: 400 })
    }

    // Generate verification prompt
    const prompt = habit.verification_prompt || generateVerificationPrompt(habit.name, habit.description)

    // Verify with AI
    console.log('Verifying habit photo with AI...')
    const verification = await verifyHabitPhoto(imageBase64, habit.name, prompt)

    // Upload photo to storage
    const fileName = `${Date.now()}.jpg`
    const storagePath = `${user.id}/${habitId}/${fileName}`
    
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const { error: uploadError } = await supabase.storage
      .from('habit-verifications')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })
    }

    // Save verification result
    const { error: saveError } = await supabase
      .from('habit_verification_photos')
      .insert({
        habit_completion_id: completionId,
        user_id: user.id,
        storage_path: storagePath,
        ai_verification_result: verification,
        verified: verification.verified,
        verification_score: verification.score,
        verification_feedback: verification.feedback,
      })

    if (saveError) {
      console.error('Save verification error:', saveError)
      return NextResponse.json({ error: 'Failed to save verification' }, { status: 500 })
    }

    // If not verified, delete the completion
    if (!verification.verified) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId)
    }

    return NextResponse.json({
      success: true,
      verification: {
        verified: verification.verified,
        score: verification.score,
        feedback: verification.feedback,
        reasoning: verification.reasoning,
        suggestions: verification.suggestions,
      }
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
