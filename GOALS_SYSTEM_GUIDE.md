# 🎯 AI-Powered Goals System Guide

## Overview

The Goals System is a comprehensive, AI-powered goal tracking and achievement platform that:

- **Tracks your goals** with measurable progress and milestones
- **Connects habits to goals** to show how daily actions drive long-term success
- **AI-powered insights** that analyze your progress and provide personalized recommendations
- **Email integration** with goal progress updates in your daily summaries
- **Smart assessments** that evaluate trajectory, identify blockers, and suggest next steps

## Features

### 🎯 Goal Management
- **Multiple goal categories**: Health, Career, Financial, Personal, Learning, Relationships, Other
- **Priority levels**: Low, Medium, High, Critical
- **Measurable tracking**: Set target values with units (kg, hours, dollars, books, etc.)
- **Milestones**: Break down big goals into smaller, trackable steps
- **Status tracking**: Active, Completed, Paused, Abandoned

### 🤖 AI-Powered Assessment
The system analyzes:
- **Overall progress** (0-100%)
- **Trajectory**: On track, Ahead, Behind, or Stalled
- **Habit alignment**: How well your daily habits support each goal
- **Blockers**: Potential obstacles identified from patterns
- **Wins**: Recent achievements and streaks
- **Next steps**: Specific, actionable recommendations

### 📊 Progress Tracking
- **Progress logs**: Track quantifiable metrics over time
- **Trend analysis**: Visualize your progress trajectory
- **Habit connections**: Link habits to goals with contribution weights
- **Completion percentage**: Automatic calculation based on milestones or metrics

### 📧 Email Integration
- **Goal insights in daily emails**: Morning and EOD summaries include top 3 goals
- **Progress updates**: See trajectory and key insights
- **Actionable recommendations**: Get specific next steps
- **Personalized to your data**: Based on actual habit completions, journal entries, and progress

## Setup Instructions

### 1. Run Database Migration

In Supabase Dashboard SQL Editor:

```sql
-- Run the migration file
-- Location: supabase/migrations/20240315000012_add_goals_system.sql
```

Or copy and paste the entire migration SQL from the file.

### 2. Update Environment Variables

No additional environment variables needed! The system uses your existing:
- `OPENAI_API_KEY` or `GEMINI_API_KEY` for AI assessments
- Falls back to rule-based assessments if no AI configured

### 3. Enable Goal Insights in Settings

1. Go to Settings → Email Notifications
2. Toggle "Goal Email Insights" (enabled by default)
3. Set assessment frequency: Daily, Weekly, Biweekly, or Monthly

## How to Use

### Creating a Goal

1. **Navigate to Goals page** (will be added to navigation)
2. **Click "New Goal"**
3. **Fill in details**:
   - **Title**: Clear, specific goal name
   - **Description**: Why this matters, context
   - **Category**: Choose the most relevant category
   - **Priority**: How important is this?
   - **Target Date**: Optional deadline
   - **Measurable**: Toggle if you have a numeric target
     - **Current Value**: Where you are now
     - **Target Value**: Where you want to be
     - **Unit**: kg, hours, dollars, books, etc.

### Adding Milestones

1. **Open a goal**
2. **Click "Add Milestone"**
3. **Define the milestone**:
   - Title and description
   - Optional target date
   - Check off when completed

### Connecting Habits

1. **Open a goal**
2. **Click "Connect Habit"**
3. **Select habit** from your existing habits
4. **Set contribution weight** (1.0 = normal, 2.0 = double impact)

The system will track how consistently you complete these habits and factor it into goal assessments.

### Logging Progress

For measurable goals:

1. **Open the goal**
2. **Click "Log Progress"**
3. **Enter current value**
4. **Add optional note**
5. **Save**

Progress is automatically charted and analyzed.

### Running AI Assessment

**Manual**:
1. Open a goal
2. Click "Assess Progress"
3. AI analyzes all data and updates insights

**Automatic**:
- Runs based on your assessment frequency setting
- Triggered during email generation
- Updates stored in goal's `ai_assessment` field

## AI Assessment Breakdown

### Overall Progress (0-100%)
Calculated from:
- Measurable goals: `(current_value / target_value) * 100`
- Milestone-based: `(completed_milestones / total_milestones) * 100`

### Trajectory
- **Ahead**: Progress > expected based on timeline
- **On Track**: Progress matches expected pace
- **Behind**: Progress < expected based on timeline
- **Stalled**: No progress in recent logs

### Insights
AI-generated observations like:
- "Excellent habit consistency at 85% - your daily actions are aligned"
- "Progress is behind schedule - consider adjusting approach or timeline"
- "Strong momentum in the last 2 weeks"

### Recommendations
Actionable advice such as:
- "Focus on improving: Morning Meditation, Reading"
- "With less than 30 days remaining, intensify efforts"
- "Consider breaking this into smaller milestones"

### Habit Alignment
For each connected habit:
- **Contribution Score**: How much this habit helps (0-100)
- **Consistency**: Completion rate over last 30 days (0-100)

### Blockers
Potential obstacles identified:
- Low habit consistency
- Stalled progress
- Approaching deadline with low completion

### Wins
Celebrations:
- "Morning Meditation: 14 day streak!"
- "Reached 50% of target ahead of schedule"

### Next Steps
Specific actions:
1. "Complete 5 more sessions this week"
2. "Review and adjust target if needed"
3. "Add a milestone for the next phase"

## Email Integration

### EOD Summary
Includes top 3 active goals (by priority):
```
🎯 Your Goals Progress

✅ Learn Spanish
Progress: 65%
Insight: Excellent habit consistency - daily practice is paying off
Next: Complete 3 more lessons this week

🚀 Run Marathon
Progress: 82%
Insight: Ahead of schedule! Current pace exceeds expectations
Next: Maintain current training intensity

⚠️ Save $10,000
Progress: 45%
Insight: Progress is behind schedule
Next: Review budget and increase monthly savings
```

### Morning Email
Same format, energizing you for the day ahead with goal context.

## Best Practices

### 1. Start Small
- Create 1-3 goals initially
- Add more as you build the habit of tracking

### 2. Make Goals Measurable
- Quantifiable goals get better AI insights
- Use specific units (kg, hours, pages, dollars)

### 3. Connect Relevant Habits
- Link 2-4 habits per goal
- Set contribution weights based on impact
- Review connections monthly

### 4. Log Progress Regularly
- Weekly for long-term goals
- Daily for short-term goals
- Add notes to capture context

### 5. Review AI Assessments
- Run manual assessments when making changes
- Read recommendations carefully
- Adjust habits or targets based on insights

### 6. Use Milestones
- Break 6+ month goals into monthly milestones
- Celebrate milestone completions
- Adjust future milestones based on progress

### 7. Update Goal Status
- Mark completed goals as "Completed"
- Pause goals when life changes
- Archive abandoned goals for learning

## Example Goals

### Health Goal
- **Title**: "Lose 10kg"
- **Category**: Health
- **Measurable**: Yes
- **Current**: 80kg
- **Target**: 70kg
- **Unit**: kg
- **Connected Habits**: Morning Run, Healthy Eating, Water Intake
- **Milestones**:
  - Lose first 2kg
  - Reach 75kg
  - Maintain 72kg for 2 weeks
  - Final goal: 70kg

### Career Goal
- **Title**: "Get promoted to Senior Developer"
- **Category**: Career
- **Measurable**: No (milestone-based)
- **Connected Habits**: Daily Coding, Read Tech Articles, Side Projects
- **Milestones**:
  - Complete advanced course
  - Lead 2 major projects
  - Present at team meeting
  - Receive positive performance review
  - Promotion achieved

### Financial Goal
- **Title**: "Save $10,000 for emergency fund"
- **Category**: Financial
- **Measurable**: Yes
- **Current**: $2,500
- **Target**: $10,000
- **Unit**: dollars
- **Connected Habits**: Track Expenses, Budget Review
- **Milestones**:
  - Save first $5,000
  - Reach $7,500
  - Final goal: $10,000

## Troubleshooting

### AI Assessment Not Running
- Check `OPENAI_API_KEY` or `GEMINI_API_KEY` is set
- System falls back to rule-based if AI unavailable
- Check browser console for errors

### Goal Not Showing in Emails
- Ensure goal status is "Active"
- Check "Goal Email Insights" is enabled in Settings
- Only top 3 goals (by priority) are shown

### Habit Alignment Shows 0%
- Ensure habit is connected to goal
- Check habit has recent completions
- Contribution score needs 7+ days of data

### Progress Not Updating
- Verify you're logging progress for the correct goal
- Check current_value is being updated
- Refresh the page

## API Endpoints

### Get All Goals
```
GET /api/goals
```

### Create Goal
```
POST /api/goals
Body: { title, description, category, priority, ... }
```

### Assess Goal
```
POST /api/goals/[id]/assess
```

Returns AI assessment and updates goal.

## Database Schema

### Tables
- `goals`: Main goal data
- `goal_milestones`: Milestone tracking
- `goal_progress_logs`: Progress history
- `goal_habits`: Habit-goal connections

### Key Fields
- `ai_assessment`: JSONB with full AI analysis
- `last_assessment_at`: Timestamp of last assessment
- `is_measurable`: Boolean for numeric tracking
- `current_value` / `target_value`: For measurable goals

## Future Enhancements

- Goal templates for common goals
- Goal sharing and accountability partners
- Weekly/monthly goal reports
- Goal achievement celebrations
- Habit recommendations based on goals
- Goal dependencies and relationships
- Public goal showcase

---

**Start tracking your goals today and let AI help you achieve them! 🚀**
