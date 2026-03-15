# 📸 Strict Habit Verification System

## Overview

A camera-only photo verification system with AI validation to ensure habits are genuinely completed. Perfect for accountability and preventing "checkbox habits."

## Features

### 🔒 Strict Mode
- **Camera-only**: Must take photo in real-time (no uploads)
- **AI verification**: OpenAI Vision or Gemini analyzes the photo
- **Auto-rejection**: Completion deleted if photo doesn't verify
- **Verification score**: 0-100 confidence rating
- **Detailed feedback**: AI explains why it passed/failed

### 📷 Camera Capture
- **Real-time only**: Uses device camera, no gallery access
- **Front/back camera**: Toggle between cameras
- **Grid overlay**: Helps with photo composition
- **Preview before submit**: Review photo before AI verification
- **Full-screen capture**: Immersive verification experience

### 🤖 AI Validation
Checks for:
- **Activity visibility**: Is the habit action clearly shown?
- **Authenticity**: Real-time photo vs screenshot/old photo
- **Effort evidence**: Does it show actual completion?
- **Context matching**: Does it match the habit description?

### 💡 Smart Prompts
Auto-generates verification criteria based on habit type:
- **Workout**: Looks for gym equipment, exercise clothes, activity
- **Reading**: Looks for open book, e-reader, reading material
- **Meditation**: Looks for meditation posture, calm environment
- **Cooking**: Looks for ingredients, cooking in progress, prepared food
- **Running**: Looks for running shoes, outdoor/treadmill, fitness tracker
- And more...

## Setup

### 1. Run Database Migration

```sql
-- Run: supabase/migrations/20240315000013_add_strict_habit_verification.sql
```

This creates:
- `habit_verification_photos` table
- Storage bucket for photos
- RLS policies
- Helper functions

### 2. Environment Variables

Already configured if you have:
- `OPENAI_API_KEY` (for GPT-4 Vision)
- OR `GEMINI_API_KEY` (for Gemini Pro Vision)

### 3. Enable Strict Mode on a Habit

When creating/editing a habit:
1. Toggle "Strict Mode" ON
2. Optionally set custom verification prompt
3. Save

## How It Works

### User Flow

1. **Mark habit as complete**
   - If strict mode: Camera opens automatically
   - If normal mode: Marked complete immediately

2. **Take photo**
   - Camera opens in full-screen
   - User takes photo showing habit completion
   - Preview photo before submitting

3. **AI verification**
   - Photo sent to AI for analysis
   - AI checks if photo shows genuine completion
   - Returns verification result with score

4. **Result**
   - ✅ **Verified (score ≥ 70)**: Habit marked complete, photo saved
   - ❌ **Not verified (score < 70)**: Completion deleted, feedback shown
   - User can retry immediately

### Example Verification

**Habit**: "Morning Workout"

**Photo taken**: User at gym with dumbbells

**AI Analysis**:
```json
{
  "verified": true,
  "score": 95,
  "feedback": "Great! Photo clearly shows workout in progress.",
  "reasoning": "Image shows person in gym attire holding dumbbells in a gym setting. Clear evidence of exercise activity.",
  "suggestions": []
}
```

**Result**: ✅ Habit marked complete

---

**Habit**: "Morning Workout"

**Photo taken**: Screenshot of workout app

**AI Analysis**:
```json
{
  "verified": false,
  "score": 25,
  "feedback": "Photo appears to be a screenshot, not a real-time photo.",
  "reasoning": "Image shows a phone screenshot of a fitness app rather than actual workout activity. Need to see real exercise in progress.",
  "suggestions": [
    "Take a photo of yourself exercising",
    "Show gym equipment you're using",
    "Capture the actual workout environment"
  ]
}
```

**Result**: ❌ Completion deleted, user must retake

## Custom Verification Prompts

Set specific requirements for each habit:

### Example 1: Meal Prep
```
Verify that this photo shows meal prep in progress. 
Look for: fresh ingredients, cooking utensils, 
multiple portions being prepared, or completed meal containers.
```

### Example 2: Meditation
```
Verify meditation session. Look for: meditation posture 
(sitting cross-legged or on chair), calm environment, 
meditation timer/app visible, or peaceful setting.
```

### Example 3: Reading
```
Verify reading activity. Look for: open book with visible text, 
e-reader showing book content, or person actively reading. 
Must show current page, not just book cover.
```

## Verification Scoring

- **90-100**: Perfect - Clear, authentic evidence
- **70-89**: Good - Verified with minor suggestions
- **50-69**: Questionable - Borderline, may need retake
- **0-49**: Failed - Does not show habit completion

**Threshold**: 70+ to pass

## Technical Details

### Database Schema

```sql
-- Habits table additions
ALTER TABLE habits
ADD COLUMN strict_mode BOOLEAN DEFAULT false,
ADD COLUMN verification_prompt TEXT;

-- Verification photos table
CREATE TABLE habit_verification_photos (
    id UUID PRIMARY KEY,
    habit_completion_id UUID REFERENCES habit_completions(id),
    user_id UUID REFERENCES auth.users(id),
    storage_path TEXT,
    ai_verification_result JSONB,
    verified BOOLEAN,
    verification_score NUMERIC,
    verification_feedback TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### API Endpoint

```
POST /api/habits/verify
Body: {
  habitId: string,
  completionId: string,
  imageBase64: string
}

Response: {
  success: boolean,
  verification: {
    verified: boolean,
    score: number,
    feedback: string,
    reasoning: string,
    suggestions: string[]
  }
}
```

### Storage

Photos stored in Supabase Storage:
- Bucket: `habit-verifications`
- Path: `{userId}/{habitId}/{timestamp}.jpg`
- Private (user-only access)
- Automatic cleanup on completion deletion

## Use Cases

### 1. Fitness Accountability
- **Workout**: Photo of you exercising
- **Running**: Photo of running shoes + outdoor/treadmill
- **Yoga**: Photo of you in yoga pose on mat

### 2. Learning Habits
- **Reading**: Photo of open book you're reading
- **Study**: Photo of study materials + notes
- **Practice**: Photo of instrument/activity in progress

### 3. Health Habits
- **Meal Prep**: Photo of healthy food preparation
- **Hydration**: Photo of water bottle + drinking
- **Meditation**: Photo of meditation setup/posture

### 4. Productivity
- **Clean Desk**: Photo of organized workspace
- **Morning Routine**: Photo of completed routine steps
- **Journaling**: Photo of journal entry being written

## Best Practices

### For Users

1. **Take clear photos**: Good lighting, focused, shows activity
2. **Show context**: Include relevant environment/equipment
3. **Be authentic**: Real-time photos, not screenshots
4. **Follow prompts**: Read verification requirements carefully

### For Habit Creators

1. **Be specific**: Clear verification prompts get better results
2. **Set expectations**: Tell users what to photograph
3. **Use strict mode wisely**: For habits where proof matters most
4. **Test first**: Try a few completions to tune the prompt

## Privacy & Security

- ✅ Photos stored privately (user-only access)
- ✅ No photos shared or made public
- ✅ AI processes images securely via API
- ✅ Photos deleted when completion deleted
- ✅ RLS policies prevent unauthorized access

## Troubleshooting

### Camera Won't Open
- Grant camera permissions in browser
- Try different browser (Chrome/Safari recommended)
- Check device camera is working

### Verification Always Fails
- Review custom verification prompt
- Ensure photo clearly shows the activity
- Check lighting and photo quality
- Try more obvious evidence in photo

### AI Not Available
- Verify `OPENAI_API_KEY` or `GEMINI_API_KEY` is set
- Check API key is valid and has credits
- Review server logs for specific errors

## Future Enhancements

- [ ] Verification history view
- [ ] Photo gallery for completed habits
- [ ] Streak photos showcase
- [ ] Social sharing of verified completions
- [ ] Custom AI models for specific habit types
- [ ] Video verification for complex habits
- [ ] Multi-photo verification
- [ ] Time-based verification (must be taken within X hours)

---

**Make your habits count with AI-verified proof! 💪📸**
