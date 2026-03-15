# 📸 Strict Habit - Usage Guide

## How to Use Strict Mode Habits

### Setting Up a Strict Habit

**1. Create or Edit a Habit**

In your habit form, you'll see:
- ✅ **Strict Mode** toggle
- 📝 **Verification Prompt** (optional custom instructions)

**2. Enable Strict Mode**

Toggle "Strict Mode" ON for habits where you want photo verification.

**3. Set Verification Prompt (Optional)**

Customize what the AI should look for:
```
Example for "Morning Workout":
"Verify workout completion. Look for: gym equipment in use, 
exercise clothes, active workout, or fitness activity in progress."
```

If left empty, the system auto-generates smart prompts based on habit name.

### Completing a Strict Habit

**The flow is completely automatic:**

1. **Click the completion button** (shows camera icon 📷 instead of checkmark)

2. **Camera opens automatically** in full-screen
   - No file upload option
   - Must use device camera
   - Real-time photo only

3. **Take your photo**
   - Show evidence of habit completion
   - Use grid overlay for better composition
   - Toggle front/back camera if needed

4. **Preview and submit**
   - Review your photo
   - Click "Verify with AI" to submit
   - Or "Retake" if not satisfied

5. **AI verifies automatically** (2-3 seconds)
   - Analyzes if photo shows genuine completion
   - Checks authenticity (not a screenshot)
   - Validates against habit requirements

6. **Auto-completion based on result:**

   **✅ Verified (Score ≥ 70)**
   - Habit automatically marked complete
   - Photo saved to your account
   - Success notification shown
   
   **❌ Not Verified (Score < 70)**
   - Completion automatically deleted
   - Feedback shown explaining why
   - Suggestions provided for retry
   - Can try again immediately

### Example Flow

```
User clicks: "Morning Workout" completion button
              ↓
Camera opens automatically (full-screen)
              ↓
User takes photo of themselves at gym with dumbbells
              ↓
User clicks "Verify with AI"
              ↓
AI analyzes: "Clear evidence of workout. Person in gym 
             attire using dumbbells. Score: 95/100"
              ↓
✅ Habit automatically marked complete!
Notification: "Verified! Great workout session."
```

vs.

```
User clicks: "Morning Workout" completion button
              ↓
Camera opens automatically
              ↓
User takes screenshot of fitness app
              ↓
User clicks "Verify with AI"
              ↓
AI analyzes: "This appears to be a screenshot, not a 
             real-time photo. Score: 25/100"
              ↓
❌ Completion automatically deleted
Notification: "Verification Failed - Photo appears to be 
              a screenshot, not real-time."
Suggestions: 
  • Take a photo of yourself exercising
  • Show gym equipment you're using
  • Capture the actual workout environment
              ↓
User can click button again to retry
```

## Integration in Your Code

### Using the HabitCompletionButton Component

```tsx
import { HabitCompletionButton } from '@/components/habits/habit-completion-button'

// In your habit list/card component:
<HabitCompletionButton
  habitId={habit.id}
  habitName={habit.name}
  isCompleted={isCompletedToday}
  isStrictMode={habit.strict_mode}
  onToggle={() => {
    // This refreshes your habit data after completion/removal
    refetchHabits()
  }}
/>
```

### Component Props

- `habitId`: The habit's unique ID
- `habitName`: Display name for the camera screen
- `isCompleted`: Whether habit is completed today
- `isStrictMode`: Whether strict verification is enabled
- `onToggle`: Callback to refresh data after completion changes
- `disabled`: Optional, disables the button

### What Happens Internally

**For Normal Habits (strict_mode = false):**
1. Click → Immediately toggle completion
2. No camera, no verification
3. Instant feedback

**For Strict Habits (strict_mode = true):**
1. Click → Create temporary completion
2. Auto-open camera (full-screen)
3. User takes photo
4. Photo sent to AI for verification
5. If verified: Keep completion, show success
6. If not verified: Delete completion, show feedback
7. User can retry immediately

## Best Practices

### For Users

**Taking Good Verification Photos:**
- ✅ Clear lighting
- ✅ Show the activity in progress
- ✅ Include relevant context (equipment, environment)
- ✅ Take photo in real-time
- ❌ Don't use screenshots
- ❌ Don't use old photos
- ❌ Don't just show the result without activity

**Examples of Good Photos:**

**Workout:**
- You in gym clothes using equipment
- Selfie at gym with equipment visible
- Running shoes + outdoor trail/treadmill

**Reading:**
- Open book with visible text
- You reading with book clearly shown
- E-reader displaying book content

**Meditation:**
- You in meditation posture
- Meditation app timer running + calm environment
- Meditation mat setup

**Cooking:**
- Ingredients being prepared
- Food cooking on stove
- Multiple meal prep containers

### For Developers

**Customizing Verification Prompts:**

```typescript
// When creating/updating a habit
const habitData = {
  name: "Morning Yoga",
  strict_mode: true,
  verification_prompt: `Verify yoga practice. Look for: 
    - Yoga mat visible
    - Person in yoga pose or stretching
    - Appropriate yoga/workout attire
    - Calm, suitable environment for yoga`
}
```

**Handling Verification Results:**

The component automatically handles success/failure, but you can listen to the `onToggle` callback to:
- Refresh habit lists
- Update streak counters
- Show custom notifications
- Track verification history

## Troubleshooting

### Camera Won't Open
- **Check browser permissions**: Allow camera access
- **Try different browser**: Chrome/Safari recommended
- **Check device camera**: Ensure it's working

### Verification Always Fails
- **Review your photos**: Are they clear and showing the activity?
- **Check verification prompt**: Is it too strict or unclear?
- **Try better lighting**: Dark photos may fail
- **Show more context**: Include environment/equipment

### Completion Disappears
- **This is expected for failed verification**
- The system auto-deletes completions that don't verify
- Read the feedback message for why it failed
- Click the button again to retry with a better photo

### Want to Remove Strict Mode
1. Edit the habit
2. Toggle "Strict Mode" OFF
3. Save
4. Future completions won't require photos
5. Past verified completions remain

## Privacy & Data

- **Photos stored privately** in your Supabase account
- **Only you can access** your verification photos
- **Photos deleted** when completion is deleted
- **AI processes securely** via encrypted API
- **No sharing** - photos never made public

## Tips for Success

1. **Start with obvious habits**: Workout, reading, cooking
2. **Take clear photos**: Good lighting, focused, shows activity
3. **Be authentic**: Real-time photos work best
4. **Read feedback**: AI explains why verification failed
5. **Adjust prompts**: Customize for better accuracy
6. **Use for accountability**: Perfect for habits you tend to skip

---

**Make every habit count with AI-verified proof! 💪📸**
