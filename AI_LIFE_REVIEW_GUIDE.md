## 🧠 AI Life Review System

### Overview

A comprehensive AI-powered life analysis system that reviews your entire day based on journal entries, habits, spending, goals, and even uploaded images. Get brutally honest, deeply personal insights delivered via email.

---

## Features

### 📊 Multi-Source Data Analysis

The AI analyzes:
- **Journal entries** - Your thoughts, mood, tags
- **Uploaded images** - AI captions describe what they reveal about your lifestyle
- **Habit tracking** - Completion rates, streaks, missed days
- **Expense data** - Daily spending, budget alignment, category breakdown
- **Analytics** - Consistency scores, weekly trends
- **Your goals** - Ultimate and weekly goals
- **Historical patterns** - 7-day trends in mood, habits, spending

### 🤖 AI-Powered Insights

The AI acts as:
- Mentor
- Caring parent
- Brutally honest friend
- Life strategist
- Behavioral psychologist

### 📧 Email Delivery

Receive a beautifully formatted email with your complete life review.

---

## How It Works

### User Flow

**1. Write Your Journal Entry**
- Add your thoughts for the day
- Upload images (optional)
- Set mood and tags

**2. Choose Review Type**

Two buttons appear:
- **Save Journal** - Just saves the entry
- **Submit + AI Review** - Saves AND triggers AI analysis

**3. AI Processing** (2-3 minutes)

When you click "Submit + AI Review":
1. Journal saved to database
2. System collects all life context
3. Images analyzed and captioned by AI
4. Complete context sent to AI
5. Deep life review generated
6. Review saved to database
7. Email sent to you

**4. Receive Your Review**

Email subject: `Your AI Life Review – {Date}`

Contains 10 sections analyzing your life.

---

## Review Structure

### 1. Emotional & Mental State
Analyzes your journal tone and mood.
- Identifies: stress, excitement, avoidance, discipline, burnout
- References actual journal content

### 2. Alignment With Your Goals
Compares your stated goals vs actual actions.
- Shows where you're aligned
- Calls out where you're drifting

### 3. Habit Discipline Analysis
Reviews your habit performance.
- Habits maintained
- Habits slipping
- Dangerous patterns
- **Brutally honest feedback**

### 4. Financial Behavior
Analyzes your spending.
- Today's spending patterns
- Budget alignment
- Impulse vs responsible spending
- Category-specific insights

### 5. Lifestyle Signals From Images
Interprets uploaded images.

Examples:
- Messy room → disorganization
- Gym photo → commitment to fitness
- Late night screen → sleep issues
- Food choices → health priorities

### 6. Behavioral Pattern Detection
Identifies patterns like:
- Procrastination
- Overworking
- Emotional spending
- Avoidance habits
- Discipline streaks

### 7. Brutal Truth Section
**The most important part.**

AI tells you what you need to hear.

Example:
> "If you continue skipping gym for 6 more months while ordering food daily, you will drift completely away from your fitness goal. Your spending on food delivery ($800 this month) could fund a gym membership and meal prep."

### 8. What You Did Well Today
Highlights positives to prevent demotivation.
- Celebrates wins
- Acknowledges effort
- Reinforces good behavior

### 9. What Must Improve Tomorrow
Specific, actionable steps.

Example:
- Wake up before 7am
- No spending on delivery food
- Gym at 6pm
- Solve 3 DSA problems
- Journal before bed

### 10. Long Term Direction
Shows two futures:
- **If you maintain today's behavior** → where you'll be
- **If you improve** → what's possible

---

## Setup

### 1. Run Database Migration

```bash
# Run: supabase/migrations/20240315000014_add_ai_reviews.sql
```

Creates:
- `ai_reviews` table
- Adds `ultimate_goal` and `weekly_goal` to profiles
- RLS policies

### 2. Environment Variables

Already configured if you have:
- `OPENAI_API_KEY` (for GPT-4 Turbo)
- OR `GEMINI_API_KEY` (for Gemini Pro)

### 3. Set Your Goals

In your profile settings, add:
- **Ultimate Goal**: Your long-term life goal
- **Weekly Goal**: What you want to achieve this week

Example:
```
Ultimate Goal: Become financially independent and build impactful products

Weekly Goal:
- Solve 25 DSA problems
- Exercise 5 days
- Spend < ₹2000 this week
```

---

## API Endpoint

### POST `/api/ai/journal-review`

**Request:**
```json
{
  "journalId": "uuid-of-journal-entry"
}
```

**Response:**
```json
{
  "success": true,
  "reviewId": "uuid-of-review",
  "emailSent": true,
  "review": "Full review text..."
}
```

**Processing Steps:**
1. Fetch journal entry
2. Caption uploaded images (if any)
3. Aggregate habit data (last 7 & 30 days)
4. Aggregate expense data (today & monthly)
5. Calculate analytics scores
6. Fetch user goals
7. Analyze historical trends
8. Build comprehensive context
9. Send to AI for review
10. Save review to database
11. Send email to user

---

## Integration Example

### Journal Page Component

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Brain } from 'lucide-react'

export function JournalSubmitButtons({ journalId }: { journalId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')

  const handleAIReview = async () => {
    setIsGenerating(true)
    setStatus('Analyzing your day...')

    try {
      const response = await fetch('/api/ai/journal-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalId }),
      })

      if (!response.ok) throw new Error('Review failed')

      setStatus('Generating life insights...')
      
      const result = await response.json()

      setStatus('Sending your personal report...')
      
      setTimeout(() => {
        alert('✅ AI Life Review sent to your email!')
        setIsGenerating(false)
        setStatus('')
      }, 1000)
    } catch (error) {
      alert('Failed to generate review')
      setIsGenerating(false)
      setStatus('')
    }
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline">
        Save Journal
      </Button>
      
      <Button 
        onClick={handleAIReview}
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {status}
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            Submit + AI Review
          </>
        )}
      </Button>
    </div>
  )
}
```

---

## Data Context Breakdown

### Journal Entry
```typescript
{
  date: "March 15, 2026",
  text: "Full journal content...",
  mood: "stressed",
  tags: ["work", "deadline"],
  imageDescriptions: [
    "Messy desk with laptop and coffee cups",
    "Late night coding session screenshot"
  ]
}
```

### Habits
```typescript
[
  {
    name: "Morning Workout",
    frequency: "daily",
    completedLast7Days: 3,
    completedLast30Days: 12,
    streak: 0,
    missedDays: 4
  },
  {
    name: "Meditation",
    frequency: "daily",
    completedLast7Days: 0,
    completedLast30Days: 2,
    streak: 0,
    missedDays: 7
  }
]
```

### Expenses
```typescript
{
  todayTotal: 450,
  categoryBreakdown: [
    {
      category: "Food & Dining",
      amount: 540,
      budgetLimit: 300,
      overBudget: true
    },
    {
      category: "Entertainment",
      amount: 800,
      budgetLimit: 500,
      overBudget: true
    }
  ],
  monthlyTotal: 2340,
  totalBudget: 2000,
  overspendingCategories: ["Food & Dining", "Entertainment"]
}
```

### Analytics
```typescript
{
  habitConsistencyScore: 45,
  spendingScore: 30,
  weeklyTrends: {
    habitCompletion: [2, 3, 1, 4, 2, 3, 2],
    dailySpending: [120, 450, 80, 200, 340, 150, 450],
    moodPattern: ["happy", "stressed", "neutral", "stressed", "anxious", "neutral", "stressed"]
  }
}
```

---

## Example AI Review Output

```markdown
🧠 Daily Life Review
Date: March 15, 2026

## 1. Emotional & Mental State

Your journal reveals significant stress and anxiety. The repeated mentions of deadlines and the phrase "feeling overwhelmed" indicate you're operating under high pressure. The images you uploaded (messy desk, late-night coding) confirm a chaotic work environment and poor work-life boundaries.

## 2. Alignment With Your Goals

**Ultimate Goal:** Become financially independent and build impactful products

**Reality Check:** You're drifting. Your weekly goal was to exercise 5 days - you've done 3/7. Your spending goal was under ₹2000 - you're at ₹2340 and overspending on food delivery by 80%.

You're working hard (late nights), but not working smart. Building products requires sustained energy, not burnout.

## 3. Habit Discipline Analysis

**Slipping Badly:**
- Meditation: 0/7 days this week
- Morning Workout: 3/7 days (43% completion)

**The Pattern:** When work pressure increases, you abandon self-care habits. This is a dangerous cycle. Stress → skip habits → more stress → worse performance.

## 4. Financial Behavior

Today's ₹450 spending was entirely on food delivery. This month:
- Food & Dining: ₹540 (80% over budget)
- Entertainment: ₹800 (60% over budget)

**Brutal Truth:** You're stress-eating and stress-spending. Every food delivery order is a small surrender to convenience over discipline.

## 5. Lifestyle Signals From Images

Image 1: Messy desk with multiple coffee cups
→ Indicates disorganization, long work sessions without breaks

Image 2: Late night coding screenshot (2:47 AM timestamp)
→ Poor sleep hygiene, unsustainable work hours

These images paint a picture of someone grinding but not thriving.

## 6. Behavioral Pattern Detection

**Detected Patterns:**
1. **Stress-driven avoidance** - Skipping meditation when you need it most
2. **Emotional spending** - Food delivery as stress relief
3. **Overworking without recovery** - Late nights without exercise/meditation balance
4. **Declining discipline** - Habit completion trending downward

## 7. Brutal Truth Section

If you continue this pattern for 6 months:
- Your health will deteriorate (no exercise, poor sleep)
- Your finances will suffer (₹28,000+ wasted on delivery food)
- Your productivity will crash (burnout is inevitable)
- Your goal of building impactful products will remain a dream

You're working IN chaos, not ON your goals.

## 8. What You Did Well Today

- You journaled (self-awareness is the first step)
- You're still showing up to work despite stress
- You completed 3 workouts this week (not great, but not zero)

## 9. What Must Improve Tomorrow

**Non-negotiable actions:**
1. Wake up at 6:30 AM (set 3 alarms)
2. 10-minute meditation before work
3. Gym at 6 PM (pack bag tonight)
4. No food delivery - meal prep or cook
5. Laptop off by 11 PM
6. Clean your desk before bed

**Why these matter:** Each action breaks one negative pattern.

## 10. Long Term Direction

**If you maintain today's behavior:**
In 6 months: Burned out, ₹30K+ overspent, fitness goals abandoned, same stress levels, no meaningful product progress.

**If you improve starting tomorrow:**
In 6 months: Consistent habits, ₹30K saved, better health, clearer mind, actual progress on your products, financial independence closer.

The choice is yours. But choose today, not tomorrow.
```

---

## Best Practices

### For Users

**1. Be Honest in Your Journal**
- AI can only help if you're truthful
- Don't sugarcoat your day
- Include struggles and wins

**2. Upload Relevant Images**
- Workspace photos
- Meal photos
- Workout photos
- Environment photos

**3. Set Clear Goals**
- Make ultimate goal specific
- Make weekly goals measurable
- Update them regularly

**4. Review Regularly**
- Use AI review 2-3 times per week
- Track patterns over time
- Act on the feedback

### For Developers

**Customizing the AI Prompt**

Edit `src/lib/life-review-ai.ts` to adjust:
- Tone (more gentle or more harsh)
- Focus areas (emphasize certain aspects)
- Response structure
- Length and detail level

**Adding More Data Sources**

Extend `buildLifeReviewContext()` in `src/lib/life-review-context.ts`:
- Sleep data
- Exercise metrics
- Social interactions
- Work hours
- Screen time

---

## Privacy & Security

- ✅ Reviews stored privately in your database
- ✅ Only you can access your reviews
- ✅ AI processes data securely via API
- ✅ No data shared with third parties
- ✅ Images captioned but not stored by AI service

---

## Troubleshooting

### Review Generation Fails
- Check AI API key is valid
- Verify journal exists and belongs to user
- Check server logs for specific errors

### Email Not Received
- Verify email service is configured
- Check spam folder
- Confirm email in profile is correct

### Review Feels Generic
- Ensure goals are set in profile
- Add more detail to journal entries
- Upload images for deeper insights
- Track habits and expenses consistently

---

## Future Enhancements

- [ ] Weekly summary reviews
- [ ] Monthly progress reports
- [ ] Goal achievement predictions
- [ ] Comparison with past reviews
- [ ] Voice journal entry support
- [ ] Real-time habit coaching
- [ ] Peer comparison (anonymous)

---

**Get brutally honest insights that actually help you improve! 🧠💪**
