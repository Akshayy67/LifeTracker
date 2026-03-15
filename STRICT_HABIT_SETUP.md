# 📸 Setting Up Strict Mode Habits

## How to Enable Strict Mode

### When Creating a New Habit

**1. Open the Create Habit Form**

**2. Fill in Basic Details:**
- Habit name (e.g., "Morning Workout")
- Description (optional)
- Frequency (daily/weekly/monthly)
- Target count
- Color and icon

**3. Enable Strict Mode:**

Scroll down to find the **Strict Mode** toggle:

```
┌─────────────────────────────────────────────────┐
│ 📷 Strict Mode                            [OFF] │
│ Require photo verification with AI validation  │
│ before marking complete                         │
└─────────────────────────────────────────────────┘
```

Toggle it **ON**.

**4. Add Verification Instructions (Optional):**

When strict mode is enabled, a new field appears:

```
Verification Instructions (Optional)
┌─────────────────────────────────────────────────┐
│ e.g., Look for: gym equipment in use, workout  │
│ clothes, active exercise. The photo should     │
│ show genuine workout activity, not just gym    │
│ arrival.                                        │
└─────────────────────────────────────────────────┘

Tell the AI what to look for in verification photos.
Leave empty for auto-generated prompts.
```

**5. Save the Habit**

Click "Create Habit" - your strict mode habit is ready!

---

## When Editing an Existing Habit

**1. Open the habit you want to edit**

**2. Toggle Strict Mode ON**

**3. Add verification instructions if needed**

**4. Update the habit**

All future completions will require photo verification.

**Note:** Past completions remain unchanged.

---

## Verification Prompt Examples

### Workout Habits

**Habit:** "Morning Gym Session"

**Verification Prompt:**
```
Look for: gym equipment in use, workout clothes, 
active exercise, or fitness activity in progress. 
The photo should show you actually working out, 
not just arriving at the gym.
```

---

**Habit:** "30-Minute Run"

**Verification Prompt:**
```
Look for: running shoes on feet, outdoor trail or 
treadmill, fitness tracker showing run in progress, 
or clear evidence of running activity.
```

---

### Learning Habits

**Habit:** "Read 30 Pages"

**Verification Prompt:**
```
Look for: open book with visible text, e-reader 
displaying book content, or person actively reading. 
Must show current page being read, not just book cover.
```

---

**Habit:** "Solve 3 DSA Problems"

**Verification Prompt:**
```
Look for: code editor with DSA problem solution, 
coding platform showing completed problems, or 
whiteboard with algorithm work. Must show actual 
problem-solving, not just problem statement.
```

---

### Health Habits

**Habit:** "Drink 8 Glasses of Water"

**Verification Prompt:**
```
Look for: water bottle or glass with water, 
person drinking water, or tracking app showing 
water intake. Photo should show actual hydration 
activity.
```

---

**Habit:** "10-Minute Meditation"

**Verification Prompt:**
```
Look for: meditation posture (sitting cross-legged 
or on chair), meditation timer/app running, calm 
environment, or meditation mat/cushion in use.
```

---

### Productivity Habits

**Habit:** "Meal Prep Sunday"

**Verification Prompt:**
```
Look for: fresh ingredients being prepared, cooking 
in progress, multiple meal containers, or completed 
meal prep portions. Must show actual meal preparation 
activity.
```

---

**Habit:** "Clean Workspace"

**Verification Prompt:**
```
Look for: organized desk, cleaning supplies in use, 
tidy workspace, or clear before/after difference. 
Must show actual cleaning or organized result.
```

---

## Auto-Generated Prompts

If you **leave the verification prompt empty**, the AI automatically generates smart prompts based on your habit name:

| Habit Name Contains | Auto-Generated Prompt Looks For |
|---------------------|----------------------------------|
| "workout", "exercise", "gym" | Gym equipment, workout clothes, exercise activity |
| "read", "book" | Open book with visible text, e-reader, reading activity |
| "meditat" | Meditation posture, calm environment, meditation app |
| "cook", "meal prep" | Ingredients, cooking in progress, prepared food |
| "run", "jog" | Running shoes, outdoor/treadmill, fitness tracker |
| "yoga" | Yoga mat, yoga pose, yoga class/video |
| "water", "hydrat" | Water bottle, drinking water |
| "clean" | Cleaning supplies, tidy space, cleaning in progress |

**Example:**

If you create a habit named "Morning Yoga" with strict mode ON and **no custom prompt**, the AI will automatically look for:
- Yoga mat
- Yoga pose
- Yoga class or video

---

## Best Practices

### ✅ DO:

- **Be specific** about what the photo should show
- **Mention key objects** that should be visible (equipment, materials, etc.)
- **Describe the activity** that should be in progress
- **Set clear expectations** for what counts as completion

### ❌ DON'T:

- Make prompts too vague ("just show the habit")
- Be unreasonably strict (AI needs clear visual evidence)
- Forget to test - try a few completions to tune the prompt
- Use prompts that require reading text in images (AI can't read small text reliably)

---

## Testing Your Strict Habit

**After creating a strict habit:**

1. **Try to complete it** - Click the completion button
2. **Camera opens** automatically
3. **Take a test photo** showing the activity
4. **See if AI verifies** it correctly

**If verification fails when it shouldn't:**
- Review the verification prompt
- Make it more specific or less strict
- Update the habit with a better prompt
- Try again

**If verification passes when it shouldn't:**
- Make the prompt more strict
- Add specific requirements
- Mention what should NOT be accepted

---

## Switching Between Modes

### Normal → Strict Mode

1. Edit the habit
2. Toggle strict mode ON
3. Add verification prompt (optional)
4. Save

**Result:** Future completions require photos

### Strict → Normal Mode

1. Edit the habit
2. Toggle strict mode OFF
3. Save

**Result:** Future completions work normally (no photos)

---

## UI Indicators

**In Habit List:**

- **Normal habits:** Show checkmark icon ✓
- **Strict habits:** Show camera icon 📷

**When Completing:**

- **Normal habits:** Click → Immediately complete
- **Strict habits:** Click → Camera opens → Take photo → AI verifies → Auto-complete

---

## Example: Complete Setup Flow

**Goal:** Create a strict habit for morning workouts

**Step 1:** Create habit
```
Name: Morning Workout
Description: 30-minute gym session
Frequency: Daily
Target: 1 per day
```

**Step 2:** Enable strict mode
```
[✓] Strict Mode
```

**Step 3:** Add verification prompt
```
Look for: gym equipment in use (dumbbells, machines, 
treadmill), workout clothes, active exercise. Photo 
should show me actually working out with equipment 
visible, not just gym arrival or locker room.
```

**Step 4:** Save habit

**Step 5:** Test it tomorrow
- Click completion button
- Camera opens
- Take photo at gym showing workout
- AI verifies
- Habit marked complete!

---

## Troubleshooting

### "Camera won't open"
- Check browser camera permissions
- Try different browser (Chrome/Safari recommended)

### "Verification always fails"
- Review your prompt - is it too strict?
- Check photo quality - is it clear?
- Try more obvious evidence in photo

### "Verification passes too easily"
- Make prompt more specific
- Add stricter requirements
- Mention what should NOT pass

### "Want to disable strict mode"
- Edit habit
- Toggle strict mode OFF
- Save

---

**Now you're ready to create accountability-driven habits with photo proof! 💪📸**
