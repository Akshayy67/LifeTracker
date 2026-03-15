import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface DailySummary {
  habitsCompleted: number
  totalHabits: number
  journalEntries: number
  expensesTracked: number
  totalExpenses: number
  streaks: Array<{ habitName: string; streak: number }>
}

export async function generateMotivationalMessage(
  userName: string,
  summary: DailySummary,
  isEOD: boolean
): Promise<string> {
  if (!openai) {
    // Fallback to template-based message if no AI configured
    return generateTemplateMessage(userName, summary, isEOD)
  }

  try {
    const prompt = isEOD
      ? `Generate a warm, encouraging end-of-day message for ${userName}. 
         Today they completed ${summary.habitsCompleted} out of ${summary.totalHabits} habits, 
         wrote ${summary.journalEntries} journal entries, and tracked ${summary.expensesTracked} expenses totaling $${summary.totalExpenses}.
         ${summary.streaks.length > 0 ? `They have active streaks: ${summary.streaks.map(s => `${s.habitName} (${s.streak} days)`).join(', ')}.` : ''}
         
         Keep it personal, motivating, and under 100 words. Focus on celebrating progress and encouraging consistency.
         Use a friendly, supportive tone. Don't use emojis.`
      : `Generate an inspiring morning message for ${userName}.
         Yesterday they completed ${summary.habitsCompleted} out of ${summary.totalHabits} habits.
         ${summary.streaks.length > 0 ? `They're maintaining streaks in: ${summary.streaks.map(s => s.habitName).join(', ')}.` : ''}
         
         Keep it energizing, forward-looking, and under 80 words. Remind them about the power of 1% daily improvement.
         Use an uplifting, motivational tone. Don't use emojis.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive life coach helping people build better habits and track their personal growth. Be warm, genuine, and motivating without being cheesy.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    })

    return completion.choices[0]?.message?.content || generateTemplateMessage(userName, summary, isEOD)
  } catch (error) {
    console.error('Error generating AI message:', error)
    return generateTemplateMessage(userName, summary, isEOD)
  }
}

function generateTemplateMessage(
  userName: string,
  summary: DailySummary,
  isEOD: boolean
): string {
  const firstName = userName.split(' ')[0] || userName

  if (isEOD) {
    const completionRate = summary.totalHabits > 0 
      ? Math.round((summary.habitsCompleted / summary.totalHabits) * 100)
      : 0

    if (completionRate === 100) {
      return `Incredible work today, ${firstName}! You completed all ${summary.totalHabits} habits. This kind of consistency is what builds extraordinary results. Rest well knowing you gave it your all today.`
    } else if (completionRate >= 75) {
      return `Great day, ${firstName}! You completed ${summary.habitsCompleted} out of ${summary.totalHabits} habits (${completionRate}%). That's solid progress. ${summary.streaks.length > 0 ? `Your streaks are growing stronger.` : ''} Tomorrow is another opportunity to build on this momentum.`
    } else if (completionRate >= 50) {
      return `${firstName}, you showed up today and that's what matters. ${summary.habitsCompleted} habits completed. Remember, consistency beats perfection. Tomorrow is a fresh start to push a little further.`
    } else {
      return `${firstName}, today might not have gone as planned, but you're still tracking and that shows commitment. Tomorrow is a new day, a new chance. Small steps forward are still steps forward.`
    }
  } else {
    // Morning message
    if (summary.streaks.length > 0) {
      const longestStreak = Math.max(...summary.streaks.map(s => s.streak))
      return `Good morning, ${firstName}! You have a ${longestStreak}-day streak going. That's ${longestStreak} days of choosing progress over comfort. Today is day ${longestStreak + 1}. Let's make it count. Remember: 1% better every day compounds into remarkable growth.`
    } else {
      return `Good morning, ${firstName}! Today is a fresh opportunity to build the life you want. Every small action you take today moves you closer to your goals. Start with one habit, then another. You've got this!`
    }
  }
}

// Gemini alternative (if user prefers Google's AI)
export async function generateMotivationalMessageGemini(
  userName: string,
  summary: DailySummary,
  isEOD: boolean
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return generateTemplateMessage(userName, summary, isEOD)
  }

  try {
    const prompt = isEOD
      ? `Generate a warm, encouraging end-of-day message for ${userName}. Today: ${summary.habitsCompleted}/${summary.totalHabits} habits, ${summary.journalEntries} journal entries, ${summary.expensesTracked} expenses ($${summary.totalExpenses}). Keep it personal, under 100 words.`
      : `Generate an inspiring morning message for ${userName}. Yesterday: ${summary.habitsCompleted}/${summary.totalHabits} habits. Keep it energizing, under 80 words. Mention 1% daily improvement.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          },
        }),
      }
    )

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateTemplateMessage(userName, summary, isEOD)
  } catch (error) {
    console.error('Error generating Gemini message:', error)
    return generateTemplateMessage(userName, summary, isEOD)
  }
}
