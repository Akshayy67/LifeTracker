// Test the exact life review request
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '.env.local')
let apiKey = null

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/GEMINI_API_KEY=(.+)/)
  if (match) {
    apiKey = match[1].trim()
  }
}

async function testLifeReview() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('🧪 Testing life review with gemini-2.5-pro...\n')
  
  const systemPrompt = `You are a deep life reflection AI.

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
- actionable
- emotionally intelligent

=== RESPONSE FORMAT ===

You must respond with a structured life review in the following EXACT format:

## 🧠 EMOTIONAL STATE
[Analyze emotional patterns from journal entries]

## 🎯 GOAL ALIGNMENT  
[Review progress towards stated goals]

## 💪 HABIT DISCIPLINE
[Evaluate habit consistency and quality]

## 💰 FINANCIAL BEHAVIOR
[Analyze spending patterns and financial decisions]

## 📸 LIFESTYLE SIGNALS
[Interpret what images reveal about lifestyle]

## 🔍 PATTERN DETECTION
[Identify recurring behavioral patterns]

## 💊 BRUTAL TRUTH
[Direct, uncomfortable truths that need to be heard]

## 🚀 ACTION PLAN
[Specific, actionable steps for improvement]

=== ANALYSIS GUIDELINES ===

1. Be specific and reference actual data
2. Connect different data points (e.g., spending vs goals)
3. Identify both strengths and concerns
4. Provide concrete, actionable advice
5. Maintain balance between support and challenge
6. Look for patterns across time periods
7. Consider seasonal and contextual factors

=== TONE GUIDELINES ===

- Start with acknowledgment of efforts
- Mix praise with constructive criticism
- Use "we" language for suggestions
- Be direct but compassionate
- End with encouragement and specific next steps`

  const contextPrompt = `=== LIFE REVIEW CONTEXT ===

User: Test User
Timezone: America/New_York
Review Period: Last 30 days

## 📝 JOURNAL ENTRIES
Total: 5 entries
Recent themes: work stress, health focus, family time

## ✅ HABITS
Total: 3 habits
- Morning Meditation: 80% completion
- Exercise: 60% completion  
- Reading: 40% completion

## 💰 EXPENSES
Total: $1,234.56
Top categories: Food ($400), Transport ($200), Entertainment ($150)

## 🎯 GOALS
Active: 2 goals
- Career Development: In progress
- Health Improvement: Some progress

## 📸 IMAGES
Total: 3 images
- Home office setup
- Gym session
- Family dinner

## 📊 ANALYTICS
- Most productive: Morning hours
- Mood trend: Improving
- Stress level: Moderate

=== END CONTEXT ===`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: contextPrompt }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500,
          }
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ Life review generation works!')
      console.log('Response length:', text?.length || 0, 'characters')
      console.log('First 200 chars:', text?.substring(0, 200) + '...')
    } else {
      const error = await response.json()
      console.error('❌ Life review failed:', error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testLifeReview()
