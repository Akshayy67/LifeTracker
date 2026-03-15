# 🎯 Goals System - Quick Start

## What You Get

An AI-powered goal tracking system that:
- **Analyzes your progress** using AI (OpenAI/Gemini) or smart rules
- **Connects to your habits** to show how daily actions drive goals
- **Sends personalized insights** in your morning/EOD emails
- **Tracks measurable progress** with charts and trends
- **Provides recommendations** on what to do next

## Setup (5 minutes)

### 1. Run Database Migration

**Supabase Dashboard** → **SQL Editor**:

```sql
-- Copy and paste from: supabase/migrations/20240315000012_add_goals_system.sql
```

This creates 4 tables: `goals`, `goal_milestones`, `goal_progress_logs`, `goal_habits`

### 2. Restart Dev Server

```bash
npm run dev
```

### 3. Enable in Settings (Optional)

Settings → Email Notifications → "Goal Email Insights" (enabled by default)

## Create Your First Goal

### Example: "Lose 10kg"

1. **Title**: Lose 10kg
2. **Category**: Health
3. **Priority**: High
4. **Target Date**: 3 months from now
5. **Measurable**: ✅ Yes
   - Current: 80kg
   - Target: 70kg
   - Unit: kg
6. **Connect Habits**: Morning Run, Healthy Eating
7. **Add Milestones**:
   - Lose first 2kg
   - Reach 75kg
   - Final: 70kg

### Example: "Learn Spanish"

1. **Title**: Become conversational in Spanish
2. **Category**: Learning
3. **Priority**: Medium
4. **Target Date**: 6 months
5. **Measurable**: ✅ Yes
   - Current: 0 lessons
   - Target: 100 lessons
   - Unit: lessons
6. **Connect Habits**: Daily Duolingo, Spanish Podcast
7. **Milestones**:
   - Complete 25 lessons
   - Complete 50 lessons
   - Complete 75 lessons
   - Complete 100 lessons

## How AI Assessment Works

### What It Analyzes

- Your goal's progress over time
- Connected habit completion rates
- Recent journal entries mentioning the goal
- Days elapsed vs days remaining
- Milestone completion status

### What You Get

**Overall Progress**: 0-100% completion

**Trajectory**:
- 🚀 **Ahead**: You're crushing it!
- ✅ **On Track**: Right on schedule
- ⚠️ **Behind**: Need to pick up pace
- ⏸️ **Stalled**: No recent progress

**Insights**: Key observations like:
- "Excellent habit consistency at 85%"
- "Strong momentum in last 2 weeks"
- "Progress stalled - last update was 10 days ago"

**Recommendations**: Specific actions:
- "Focus on improving: Morning Meditation"
- "Add 2 more sessions per week"
- "Consider breaking into smaller milestones"

**Habit Alignment**: Shows which habits help most

**Next Steps**: 1-3 specific actions to take

## Email Integration

Your top 3 goals (by priority) appear in daily emails:

```
🎯 Your Goals Progress

✅ Learn Spanish
Progress: 65%
Insight: Excellent habit consistency - daily practice paying off
Next: Complete 3 more lessons this week

🚀 Run Marathon  
Progress: 82%
Insight: Ahead of schedule!
Next: Maintain current training intensity
```

## Tips

1. **Start with 1-3 goals** - Don't overwhelm yourself
2. **Make goals measurable** - Numbers get better AI insights
3. **Connect 2-4 habits per goal** - Shows daily → long-term link
4. **Log progress weekly** - Keeps AI assessment accurate
5. **Run manual assessment** when you make big changes
6. **Review insights in emails** - They're personalized to YOU

## Next Steps

1. Run the database migration
2. Create your first goal
3. Connect some habits to it
4. Log initial progress
5. Click "Assess Progress" to see AI insights
6. Check tomorrow's email for goal updates!

---

**Full documentation**: See `GOALS_SYSTEM_GUIDE.md`
