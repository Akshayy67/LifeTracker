import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    resendConfigured: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM || 'not set',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    aiService: process.env.OPENAI_API_KEY ? 'OpenAI' : process.env.GEMINI_API_KEY ? 'Gemini' : 'None (using templates)',
  }

  const issues = []
  
  if (!config.resendConfigured) {
    issues.push('RESEND_API_KEY is not set')
  }
  
  if (!config.emailFrom || config.emailFrom === 'not set') {
    issues.push('EMAIL_FROM is not set')
  }
  
  if (!config.openaiConfigured && !config.geminiConfigured) {
    issues.push('Neither OPENAI_API_KEY nor GEMINI_API_KEY is set (AI personalization will use templates)')
  }

  return NextResponse.json({
    status: issues.length === 0 ? 'ready' : 'incomplete',
    config,
    issues,
    timestamp: new Date().toISOString(),
  })
}
