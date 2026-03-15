import OpenAI from 'openai'
import { LifeReviewContext } from './life-review-context'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const SYSTEM_PROMPT = `You are a deep life reflection AI.

You are analyzing a person's life patterns using their daily data.

You have access to:
- journal entries
- habits
- spending
- reports
- goals
- image descriptions
- historical trends

Your job is to analyze the user's life honestly.

Act as a combination of:
- mentor
- caring parent
- brutally honest friend
- life strategist
- behavioral psychologist

Your response must be:
- honest
- insightful
- specific
- constructive
- emotionally intelligent

Never give generic advice.

You must connect patterns between behavior and goals.

Example:
- If the goal is fitness but gym habit is failing → call it out.
- If spending is breaking budget → analyze behavior.
- If the journal indicates stress → discuss emotional state.
- If images indicate lifestyle patterns → include that insight.

RESPONSE STRUCTURE:

🧠 Daily Life Review
Date: {date}

## 1. Emotional & Mental State
Analyze the journal tone. Explain what the user is feeling.
Look for: stress, excitement, avoidance, discipline, burnout.

## 2. Alignment With Your Goals
Compare: goal vs actions
Explain where the user is aligned or drifting.

## 3. Habit Discipline Analysis
Discuss: habits maintained, habits slipping, dangerous patterns.
Be honest.

## 4. Financial Behavior
Analyze today's spending.
Discuss: responsible spending, impulse patterns, budget alignment.

## 5. Lifestyle Signals From Images
Interpret image descriptions.
Example: messy room, gym photo, late night screen, food choices.
Explain what they indicate about lifestyle.

## 6. Behavioral Pattern Detection
Identify patterns like: procrastination, overworking, emotional spending, avoidance habits, discipline streaks.

## 7. Brutal Truth Section
Tell the user what they need to hear.
Example tone: "If you continue like this for 6 months, you will drift away from your goals."

## 8. What You Did Well Today
Highlight positives. This prevents demotivation.

## 9. What Must Improve Tomorrow
Give specific actions.
Example:
- Wake up before 7am
- No spending on delivery food
- Gym at 6pm
- Solve 3 DSA problems

## 10. Long Term Direction
Explain:
- If you maintain today's behavior → where life goes
- If you improve → what future looks like

Use markdown formatting. Be specific with data. Reference actual numbers and patterns.`

export async function generateLifeReview(context: LifeReviewContext): Promise<string> {
  const contextPrompt = buildContextPrompt(context)

  if (openai) {
    return await generateWithOpenAI(contextPrompt)
  } else if (process.env.GEMINI_API_KEY) {
    return await generateWithGemini(contextPrompt)
  } else {
    throw new Error('No AI service configured for life review')
  }
}

function buildContextPrompt(context: LifeReviewContext): string {
  return `
# USER LIFE CONTEXT

## Journal Entry - ${context.journalEntry.date}
**Mood:** ${context.journalEntry.mood || 'Not specified'}
**Tags:** ${context.journalEntry.tags.join(', ') || 'None'}

**Entry:**
${context.journalEntry.text}

${context.journalEntry.imageDescriptions.length > 0 ? `
**Images Uploaded:**
${context.journalEntry.imageDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}
` : ''}

## Habit Tracker Data
${context.habits.map(h => `
**${h.name}**
- Frequency: ${h.frequency}
- Completed last 7 days: ${h.completedLast7Days}/7
- Completed last 30 days: ${h.completedLast30Days}/30
- Current streak: ${h.streak} days
- Missed days this week: ${h.missedDays}
`).join('\n')}

## Expense Data
**Today's Total:** $${context.expenses.todayTotal.toFixed(2)}
**Monthly Total:** $${context.expenses.monthlyTotal.toFixed(2)}
**Monthly Budget:** $${context.expenses.totalBudget.toFixed(2)}

**Category Breakdown:**
${context.expenses.categoryBreakdown.map(c => `
- ${c.category}: $${c.amount.toFixed(2)}${c.budgetLimit ? ` (Budget: $${c.budgetLimit.toFixed(2)})` : ''}${c.overBudget ? ' ⚠️ OVER BUDGET' : ''}
`).join('\n')}

${context.expenses.overspendingCategories.length > 0 ? `
**Overspending Categories:** ${context.expenses.overspendingCategories.join(', ')}
` : ''}

## Analytics Reports
**Habit Consistency Score:** ${context.analytics.habitConsistencyScore}/100
**Spending Score:** ${context.analytics.spendingScore}/100

**Weekly Trends:**
- Habit completions: ${context.analytics.weeklyTrends.habitCompletion.join(', ')}
- Daily spending: $${context.analytics.weeklyTrends.dailySpending.map(s => s.toFixed(0)).join(', $')}
- Mood pattern: ${context.analytics.weeklyTrends.moodPattern.join(', ')}

## User Goals
${context.goals.ultimateGoal ? `**Ultimate Goal:** ${context.goals.ultimateGoal}` : '**Ultimate Goal:** Not set'}
${context.goals.weeklyGoal ? `**Weekly Goal:** ${context.goals.weeklyGoal}` : '**Weekly Goal:** Not set'}

## Historical Behavior (Last 7 Days)
- **Journal trend:** ${context.historicalBehavior.journalTrend}
- **Habit trend:** ${context.historicalBehavior.habitTrend}
- **Spending trend:** ${context.historicalBehavior.spendingTrend}
- **Mood trend:** ${context.historicalBehavior.moodTrend}

---

Now generate a deep, honest, specific life review following the structure in your system prompt.
Reference actual data points. Be brutally honest but constructive.
Connect patterns between their behavior and stated goals.
Make it feel deeply personal, like someone truly studied their life.
`.trim()
}

async function generateWithOpenAI(contextPrompt: string): Promise<string> {
  if (!openai) throw new Error('OpenAI not configured')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contextPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    return response.choices[0]?.message?.content || 'Unable to generate review'
  } catch (error) {
    console.error('OpenAI life review error:', error)
    throw new Error('Failed to generate life review')
  }
}

async function generateWithGemini(contextPrompt: string): Promise<string> {
  try {
    console.log('Calling Gemini API for life review...')
    console.log('Context prompt length:', contextPrompt.length)
    console.log('System prompt length:', SYSTEM_PROMPT.length)
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\n${contextPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      }
    }
    
    console.log('Request body:', JSON.stringify(requestBody).substring(0, 500) + '...')
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', JSON.stringify(errorData, null, 2))
      console.error('Response status:', response.status)
      console.error('Response statusText:', response.statusText)
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log('Gemini response received:', JSON.stringify(data).substring(0, 200))
    
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!reviewText) {
      console.error('No text in Gemini response:', data)
      throw new Error('Gemini returned empty response')
    }
    
    console.log('Life review generated successfully, length:', reviewText.length)
    return reviewText
  } catch (error) {
    console.error('Gemini life review error:', error)
    throw error
  }
}
