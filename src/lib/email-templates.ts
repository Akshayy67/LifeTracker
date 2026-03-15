import { DailySummary } from './ai'

interface PersonalReminder {
  title: string
  description?: string | null
}

export function generateEODEmailHTML(
  userName: string,
  summary: DailySummary,
  aiMessage: string,
  quote: { quote: string; author: string },
  onePercentMessage: string,
  reminders: PersonalReminder[]
): string {
  const firstName = userName.split(' ')[0] || userName
  const completionRate = summary.totalHabits > 0 
    ? Math.round((summary.habitsCompleted / summary.totalHabits) * 100)
    : 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Day in Review</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { color: #3b82f6; margin: 0 0 8px 0; font-size: 28px; }
    .header p { color: #666; margin: 0; font-size: 14px; }
    .ai-message { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .ai-message p { margin: 0; font-size: 16px; line-height: 1.6; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
    .stat-card .number { font-size: 32px; font-weight: bold; color: #3b82f6; margin: 0; }
    .stat-card .label { font-size: 14px; color: #64748b; margin: 8px 0 0 0; }
    .progress-bar { background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
    .progress-fill { background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; transition: width 0.3s ease; }
    .streaks { margin-bottom: 24px; }
    .streak-item { background: #fef3c7; padding: 12px 16px; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid #f59e0b; }
    .streak-item strong { color: #92400e; }
    .quote { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 4px; }
    .quote p { margin: 0 0 8px 0; font-style: italic; color: #1e40af; font-size: 16px; }
    .quote cite { color: #64748b; font-size: 14px; }
    .reminders { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .reminders h3 { margin: 0 0 12px 0; color: #991b1b; font-size: 16px; }
    .reminder-item { padding: 8px 0; border-bottom: 1px solid #fecaca; }
    .reminder-item:last-child { border-bottom: none; }
    .reminder-item strong { color: #7f1d1d; }
    .reminder-item p { margin: 4px 0 0 0; color: #991b1b; font-size: 14px; }
    .one-percent { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
    .one-percent p { margin: 0; color: #065f46; font-weight: 500; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌙 Your Day in Review</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="ai-message">
      <p>${aiMessage}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <p class="number">${summary.habitsCompleted}/${summary.totalHabits}</p>
        <p class="label">Habits Completed</p>
      </div>
      <div class="stat-card">
        <p class="number">${completionRate}%</p>
        <p class="label">Completion Rate</p>
      </div>
      <div class="stat-card">
        <p class="number">${summary.journalEntries}</p>
        <p class="label">Journal Entries</p>
      </div>
      <div class="stat-card">
        <p class="number">$${summary.totalExpenses.toFixed(2)}</p>
        <p class="label">Expenses Tracked</p>
      </div>
    </div>

    ${summary.habitsCompleted > 0 ? `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${completionRate}%"></div>
    </div>
    ` : ''}

    ${summary.streaks.length > 0 ? `
    <div class="streaks">
      <h3 style="margin: 0 0 12px 0; color: #1e293b;">🔥 Active Streaks</h3>
      ${summary.streaks.map(s => `
        <div class="streak-item">
          <strong>${s.habitName}</strong>: ${s.streak} days strong!
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${reminders.length > 0 ? `
    <div class="reminders">
      <h3>📌 Your Reminders for Tomorrow</h3>
      ${reminders.map(r => `
        <div class="reminder-item">
          <strong>${r.title}</strong>
          ${r.description ? `<p>${r.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="quote">
      <p>"${quote.quote}"</p>
      <cite>— ${quote.author}</cite>
    </div>

    <div class="one-percent">
      <p>${onePercentMessage}</p>
    </div>

    <div class="footer">
      <p>Keep building the life you want, one day at a time.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateMorningEmailHTML(
  userName: string,
  aiMessage: string,
  quote: { quote: string; author: string },
  onePercentMessage: string,
  reminders: PersonalReminder[],
  yesterdaySummary?: { habitsCompleted: number; totalHabits: number }
): string {
  const firstName = userName.split(' ')[0] || userName

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Good Morning!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 8px 0; font-size: 32px; }
    .header p { color: #666; margin: 0; font-size: 14px; }
    .ai-message { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .ai-message p { margin: 0; font-size: 16px; line-height: 1.6; }
    .quote { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 4px; }
    .quote p { margin: 0 0 8px 0; font-style: italic; color: #92400e; font-size: 18px; }
    .quote cite { color: #78350f; font-size: 14px; }
    .reminders { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .reminders h3 { margin: 0 0 12px 0; color: #1e40af; font-size: 16px; }
    .reminder-item { padding: 8px 0; border-bottom: 1px solid #93c5fd; }
    .reminder-item:last-child { border-bottom: none; }
    .reminder-item strong { color: #1e3a8a; }
    .reminder-item p { margin: 4px 0 0 0; color: #1e40af; font-size: 14px; }
    .one-percent { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
    .one-percent p { margin: 0; color: #065f46; font-weight: 500; font-size: 16px; }
    .cta { text-align: center; margin: 24px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☀️ Good Morning, ${firstName}!</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="ai-message">
      <p>${aiMessage}</p>
    </div>

    <div class="quote">
      <p>"${quote.quote}"</p>
      <cite>— ${quote.author}</cite>
    </div>

    ${reminders.length > 0 ? `
    <div class="reminders">
      <h3>📋 Today's Reminders</h3>
      ${reminders.map(r => `
        <div class="reminder-item">
          <strong>${r.title}</strong>
          ${r.description ? `<p>${r.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="one-percent">
      <p>${onePercentMessage}</p>
    </div>

    <div class="cta">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/habits">Start Your Day →</a>
    </div>

    <div class="footer">
      <p>Make today count. You've got this!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
