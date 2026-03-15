import OpenAI from 'openai'
import { createAdminClient } from './supabase/admin'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

interface ExpenseByCategory {
  category_id: string
  category_name: string
  category_color: string
  total_amount: number
  transaction_count: number
  budget_amount: number | null
  budget_remaining: number | null
}

interface ExpenseAnalysis {
  total_spent_today: number
  total_spent_this_month: number
  daily_average: number
  categories: ExpenseByCategory[]
  top_category: string
  budget_status: 'under' | 'on_track' | 'over' | 'no_budget'
  budget_percentage: number
  insights: string[]
  recommendations: string[]
  spending_trend: 'increasing' | 'stable' | 'decreasing'
  unusual_purchases: string[]
}

export async function analyzeExpenses(userId: string, targetDate: Date = new Date()): Promise<ExpenseAnalysis> {
  const supabase = createAdminClient()
  
  const today = format(targetDate, 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(targetDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(targetDate), 'yyyy-MM-dd')
  
  // Fetch today's expenses with categories
  const { data: todayExpenses } = await supabase
    .from('expenses')
    .select('amount, description, expense_categories(name, color)')
    .eq('user_id', userId)
    .eq('date', today)

  // Fetch this month's expenses by category
  const { data: monthlyByCategory } = await supabase
    .from('expenses')
    .select('amount, category_id, expense_categories(name, color)')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  // Fetch budgets for this month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('start_date', monthEnd)
    .or(`end_date.is.null,end_date.gte.${monthStart}`)

  // Calculate totals
  const total_spent_today = (todayExpenses || []).reduce((sum, exp) => sum + exp.amount, 0)
  const total_spent_this_month = (monthlyByCategory || []).reduce((sum, exp) => sum + exp.amount, 0)

  // Group by category
  const categoryMap = new Map<string, ExpenseByCategory>()
  
  for (const expense of monthlyByCategory || []) {
    const catId = expense.category_id || 'uncategorized'
    const catName = expense.expense_categories?.name || 'Uncategorized'
    const catColor = expense.expense_categories?.color || '#gray'
    
    if (!categoryMap.has(catId)) {
      const budget = budgets?.find(b => b.category_id === catId)
      categoryMap.set(catId, {
        category_id: catId,
        category_name: catName,
        category_color: catColor,
        total_amount: 0,
        transaction_count: 0,
        budget_amount: budget?.amount || null,
        budget_remaining: budget ? budget.amount : null,
      })
    }
    
    const cat = categoryMap.get(catId)!
    cat.total_amount += expense.amount
    cat.transaction_count += 1
    if (cat.budget_remaining !== null) {
      cat.budget_remaining = (cat.budget_amount || 0) - cat.total_amount
    }
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) => b.total_amount - a.total_amount)
  
  // Calculate budget status
  const totalBudget = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0
  const budget_percentage = totalBudget > 0 ? (total_spent_this_month / totalBudget) * 100 : 0
  
  let budget_status: 'under' | 'on_track' | 'over' | 'no_budget' = 'no_budget'
  if (totalBudget > 0) {
    if (budget_percentage < 75) budget_status = 'under'
    else if (budget_percentage < 95) budget_status = 'on_track'
    else budget_status = 'over'
  }

  // Calculate spending trend (compare to last month)
  const lastMonthStart = format(startOfMonth(subMonths(targetDate, 1)), 'yyyy-MM-dd')
  const lastMonthEnd = format(endOfMonth(subMonths(targetDate, 1)), 'yyyy-MM-dd')
  
  const { data: lastMonthExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', lastMonthStart)
    .lte('date', lastMonthEnd)

  const lastMonthTotal = (lastMonthExpenses || []).reduce((sum, exp) => sum + exp.amount, 0)
  const trendDiff = total_spent_this_month - lastMonthTotal
  const trendPercentage = lastMonthTotal > 0 ? (trendDiff / lastMonthTotal) * 100 : 0
  
  let spending_trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
  if (trendPercentage > 10) spending_trend = 'increasing'
  else if (trendPercentage < -10) spending_trend = 'decreasing'

  // Calculate daily average
  const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
  const daily_average = total_spent_this_month / daysInMonth

  // Generate insights
  const insights: string[] = []
  const recommendations: string[] = []
  const unusual_purchases: string[] = []

  // Top category insight
  if (categories.length > 0) {
    const topCat = categories[0]
    const topPercentage = (topCat.total_amount / total_spent_this_month) * 100
    insights.push(`${topCat.category_name} is your biggest expense at ${topPercentage.toFixed(0)}% of monthly spending`)
  }

  // Budget insights
  if (budget_status === 'over') {
    insights.push(`You've exceeded your monthly budget by ${(budget_percentage - 100).toFixed(0)}%`)
    recommendations.push('Review and adjust spending in top categories')
  } else if (budget_status === 'on_track') {
    insights.push(`You're at ${budget_percentage.toFixed(0)}% of your monthly budget - stay mindful`)
  } else if (budget_status === 'under') {
    insights.push(`Great job! You're only at ${budget_percentage.toFixed(0)}% of your budget`)
  }

  // Trend insights
  if (spending_trend === 'increasing') {
    insights.push(`Spending is up ${Math.abs(trendPercentage).toFixed(0)}% compared to last month`)
    recommendations.push('Identify areas where you can cut back')
  } else if (spending_trend === 'decreasing') {
    insights.push(`Excellent! Spending is down ${Math.abs(trendPercentage).toFixed(0)}% from last month`)
  }

  // Daily spending insight
  if (total_spent_today > daily_average * 2) {
    insights.push(`Today's spending (${total_spent_today.toFixed(2)}) is significantly above your daily average`)
    unusual_purchases.push(`High spending day: ${total_spent_today.toFixed(2)}`)
  }

  // Category-specific recommendations
  for (const cat of categories) {
    if (cat.budget_remaining !== null && cat.budget_remaining < 0) {
      recommendations.push(`${cat.category_name}: Over budget by ${Math.abs(cat.budget_remaining).toFixed(2)}`)
    }
  }

  // Use AI for deeper insights if available
  if (openai || process.env.GEMINI_API_KEY) {
    try {
      const aiInsights = await generateAIExpenseInsights({
        total_spent_today,
        total_spent_this_month,
        categories,
        budget_status,
        spending_trend,
        todayExpenses: todayExpenses || [],
      })
      
      if (aiInsights.insights) insights.push(...aiInsights.insights)
      if (aiInsights.recommendations) recommendations.push(...aiInsights.recommendations)
      if (aiInsights.unusual_purchases) unusual_purchases.push(...aiInsights.unusual_purchases)
    } catch (error) {
      console.error('AI expense analysis error:', error)
    }
  }

  return {
    total_spent_today,
    total_spent_this_month,
    daily_average,
    categories,
    top_category: categories[0]?.category_name || 'None',
    budget_status,
    budget_percentage,
    insights,
    recommendations,
    spending_trend,
    unusual_purchases,
  }
}

async function generateAIExpenseInsights(data: any): Promise<{
  insights: string[]
  recommendations: string[]
  unusual_purchases: string[]
}> {
  const prompt = `Analyze this spending data and provide insights:

Today's Spending: $${data.total_spent_today}
Monthly Total: $${data.total_spent_this_month}
Budget Status: ${data.budget_status}
Trend: ${data.spending_trend}

Top Categories:
${data.categories.slice(0, 3).map((c: any) => `- ${c.category_name}: $${c.total_amount} (${c.transaction_count} transactions)`).join('\n')}

Today's Purchases:
${data.todayExpenses.map((e: any) => `- ${e.description || 'Purchase'}: $${e.amount}`).join('\n')}

Provide:
1. 2-3 key insights about spending patterns
2. 2-3 actionable recommendations
3. Any unusual or noteworthy purchases

Respond in JSON format:
{
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["rec 1", "rec 2"],
  "unusual_purchases": ["unusual 1"]
}`

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a financial advisor analyzing spending patterns.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    return JSON.parse(completion.choices[0]?.message?.content || '{}')
  } else if (process.env.GEMINI_API_KEY) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{}')
  }

  return { insights: [], recommendations: [], unusual_purchases: [] }
}

export function generateExpenseEmailHTML(analysis: ExpenseAnalysis): string {
  const trendEmoji = {
    increasing: '📈',
    stable: '➡️',
    decreasing: '📉',
  }[analysis.spending_trend]

  const budgetEmoji = {
    under: '✅',
    on_track: '⚠️',
    over: '🚨',
    no_budget: '📊',
  }[analysis.budget_status]

  return `
    <h3 style="color: #10b981; margin: 20px 0 12px 0;">💰 Your Spending Today</h3>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <div>
          <p style="margin: 0; color: #064e3b; font-size: 14px;">Today's Total</p>
          <p style="margin: 4px 0 0 0; color: #047857; font-size: 24px; font-weight: bold;">$${analysis.total_spent_today.toFixed(2)}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; color: #064e3b; font-size: 14px;">Monthly Total</p>
          <p style="margin: 4px 0 0 0; color: #047857; font-size: 20px; font-weight: bold;">$${analysis.total_spent_this_month.toFixed(2)}</p>
        </div>
      </div>
      
      ${analysis.budget_status !== 'no_budget' ? `
        <div style="background: white; padding: 8px; border-radius: 4px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #064e3b;">${budgetEmoji} Budget</span>
            <span style="font-size: 14px; font-weight: bold; color: ${analysis.budget_status === 'over' ? '#dc2626' : '#047857'};">${analysis.budget_percentage.toFixed(0)}%</span>
          </div>
          <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: ${analysis.budget_status === 'over' ? '#dc2626' : analysis.budget_status === 'on_track' ? '#f59e0b' : '#10b981'}; height: 100%; width: ${Math.min(100, analysis.budget_percentage)}%; transition: width 0.3s;"></div>
          </div>
        </div>
      ` : ''}
    </div>

    <h4 style="color: #047857; margin: 16px 0 8px 0;">${trendEmoji} Spending Breakdown</h4>
    
    ${analysis.categories.slice(0, 5).map(cat => `
      <div style="background: #f8fafc; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid ${cat.category_color};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">${cat.category_name}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">${cat.transaction_count} transaction${cat.transaction_count !== 1 ? 's' : ''}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">$${cat.total_amount.toFixed(2)}</p>
            ${cat.budget_remaining !== null ? `
              <p style="margin: 4px 0 0 0; font-size: 12px; color: ${cat.budget_remaining < 0 ? '#dc2626' : '#10b981'};">
                ${cat.budget_remaining >= 0 ? `$${cat.budget_remaining.toFixed(2)} left` : `$${Math.abs(cat.budget_remaining).toFixed(2)} over`}
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('')}

    ${analysis.insights.length > 0 ? `
      <h4 style="color: #047857; margin: 16px 0 8px 0;">💡 Insights</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        ${analysis.insights.map(insight => `<li style="margin-bottom: 6px;">${insight}</li>`).join('')}
      </ul>
    ` : ''}

    ${analysis.recommendations.length > 0 ? `
      <h4 style="color: #047857; margin: 16px 0 8px 0;">📋 Recommendations</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        ${analysis.recommendations.map(rec => `<li style="margin-bottom: 6px;">${rec}</li>`).join('')}
      </ul>
    ` : ''}

    ${analysis.unusual_purchases.length > 0 ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 12px; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ Notable Purchases</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #78350f;">
          ${analysis.unusual_purchases.map(purchase => `<li>${purchase}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `
}
