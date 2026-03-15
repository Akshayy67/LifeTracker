import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export interface VerificationResult {
  verified: boolean
  score: number // 0-100
  feedback: string
  reasoning: string
  suggestions?: string[]
}

function getFallbackVerificationResult(reason: string): VerificationResult {
  return {
    verified: false,
    score: 0,
    feedback: 'Unable to verify',
    reasoning: reason,
    suggestions: ['Please try again with a clearer photo'],
  }
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const candidates: string[] = []
  const trimmed = text.trim()
  if (trimmed) candidates.push(trimmed)

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch?.[1]) {
    candidates.unshift(codeBlockMatch[1].trim())
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      // continue
    }

    const objectMatch = candidate.match(/\{[\s\S]*\}/)
    if (!objectMatch) continue

    try {
      const parsed = JSON.parse(objectMatch[0])
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      // continue
    }
  }

  return null
}

function normalizeVerificationResult(payload: Record<string, unknown>): VerificationResult {
  const verifiedRaw = payload.verified
  const verified = verifiedRaw === true || String(verifiedRaw).toLowerCase() === 'true'

  const scoreRaw = payload.score
  const parsedScore =
    typeof scoreRaw === 'number'
      ? scoreRaw
      : Number.parseFloat(String(scoreRaw ?? '').replace(/[^\d.-]/g, ''))
  const score = Number.isFinite(parsedScore) ? Math.min(100, Math.max(0, parsedScore)) : 0

  const feedback =
    typeof payload.feedback === 'string' && payload.feedback.trim()
      ? payload.feedback.trim()
      : 'Unable to verify'

  const reasoningCandidates = [payload.reasoning, payload.explanation, payload.analysis]
  const reasoning =
    reasoningCandidates.find((value) => typeof value === 'string' && value.trim())?.toString().trim() ||
    'No reasoning provided'

  let suggestions: string[] = []
  if (Array.isArray(payload.suggestions)) {
    suggestions = payload.suggestions
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  } else if (typeof payload.suggestions === 'string') {
    suggestions = payload.suggestions
      .split(/\r?\n|;/)
      .map((item) => item.replace(/^-+\s*/, '').trim())
      .filter(Boolean)
  }

  return { verified, score, feedback, reasoning, suggestions }
}

function parsePartialVerificationText(text: string): VerificationResult | null {
  const verifiedMatch = text.match(/"verified"\s*:\s*(true|false)/i)
  const scoreMatch = text.match(/"score"\s*:\s*(-?\d+(?:\.\d+)?)/i)
  const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]*)"/i)
  const reasoningMatch = text.match(/"reasoning"\s*:\s*"([^"]*)"/i)

  if (!verifiedMatch && !scoreMatch && !feedbackMatch && !reasoningMatch) {
    return null
  }

  const verified = verifiedMatch ? verifiedMatch[1].toLowerCase() === 'true' : false
  const parsedScore = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 0
  const score = Number.isFinite(parsedScore) ? Math.min(100, Math.max(0, parsedScore)) : 0
  const feedback = feedbackMatch?.[1]?.trim() || 'Unable to verify'
  const reasoning =
    reasoningMatch?.[1]?.trim() ||
    'Verification details were incomplete, but the model response indicates the habit was not clearly visible.'

  return {
    verified,
    score,
    feedback,
    reasoning,
    suggestions: ['Retake photo with clearer evidence of the habit activity'],
  }
}

export async function verifyHabitPhoto(
  imageBase64: string,
  habitName: string,
  verificationPrompt?: string
): Promise<VerificationResult> {
  if (openai) {
    return await verifyWithOpenAI(imageBase64, habitName, verificationPrompt)
  } else if (process.env.GEMINI_API_KEY) {
    return await verifyWithGemini(imageBase64, habitName, verificationPrompt)
  } else {
    throw new Error('No AI service configured for habit verification')
  }
}

async function verifyWithOpenAI(
  imageBase64: string,
  habitName: string,
  verificationPrompt?: string
): Promise<VerificationResult> {
  if (!openai) throw new Error('OpenAI not configured')

  const prompt = verificationPrompt || `Verify that this photo shows evidence of completing the habit: "${habitName}"`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: `You are a strict habit verification assistant. Analyze photos to verify if they show genuine evidence of habit completion. Be fair but thorough. Respond in JSON format with:
{
  "verified": boolean,
  "score": number (0-100),
  "feedback": "brief user-friendly message",
  "reasoning": "detailed explanation",
  "suggestions": ["optional improvement suggestions"]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${prompt}\n\nAnalyze this photo and determine if it genuinely shows completion of this habit. Consider:\n1. Is the activity clearly visible?\n2. Does it match the habit description?\n3. Is this a real-time photo (not a screenshot or old photo)?\n4. Does it show actual effort/completion?`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content || '{}'
    console.log('OpenAI raw response:', content)
    
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', content)
      return getFallbackVerificationResult('AI did not return valid response format')
    }
    
    const result = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    console.log('Parsed verification result:', result)

    return normalizeVerificationResult(result)
  } catch (error) {
    console.error('OpenAI verification error:', error)
    return {
      verified: false,
      score: 0,
      feedback: 'Unable to verify',
      reasoning: error instanceof Error ? error.message : 'Verification failed',
      suggestions: ['Please try again'],
    }
  }
}

async function verifyWithGemini(
  imageBase64: string,
  habitName: string,
  verificationPrompt?: string
): Promise<VerificationResult> {
  const prompt = verificationPrompt || `Verify that this photo shows evidence of completing the habit: "${habitName}"`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `${prompt}\n\nAnalyze this photo and respond with VALID JSON only (no markdown, no code fences).\nRequired schema:\n{\n  "verified": boolean,\n  "score": number (0-100),\n  "feedback": "brief message for the user",\n  "reasoning": "clear reason why this image does or does not prove completion",\n  "suggestions": ["1-2 practical suggestions"]\n}\n\nImportant:\n- Always include a non-empty "reasoning" string.\n- Keep reasoning specific to visible evidence in the photo.\n- If evidence is weak, explain exactly what is missing.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          }
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      console.error('Gemini API error:', data)
      const message =
        data?.error?.message && typeof data.error.message === 'string'
          ? data.error.message
          : 'Gemini request failed'
      return getFallbackVerificationResult(message)
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text ?? '')
        .join('\n')
        .trim() || ''
    console.log('Gemini raw response:', text)

    const parsed = extractJsonObject(text)
    if (!parsed) {
      const partial = parsePartialVerificationText(text)
      if (partial) {
        console.warn('Parsed partial Gemini verification response')
        return partial
      }

      console.error('No JSON found in Gemini response:', text)
      return getFallbackVerificationResult('AI did not return valid response format')
    }

    console.log('Parsed Gemini verification result:', parsed)
    return normalizeVerificationResult(parsed)
  } catch (error) {
    console.error('Gemini verification error:', error)
    return {
      verified: false,
      score: 0,
      feedback: 'Unable to verify',
      reasoning: error instanceof Error ? error.message : 'Verification failed',
      suggestions: ['Please try again'],
    }
  }
}

export function generateVerificationPrompt(habitName: string, habitDescription?: string): string {
  const basePrompt = `Verify that this photo shows genuine completion of: "${habitName}"`
  
  if (habitDescription) {
    return `${basePrompt}. Expected: ${habitDescription}`
  }

  // Generate smart prompts based on habit name
  const lowerName = habitName.toLowerCase()
  
  if (lowerName.includes('workout') || lowerName.includes('exercise') || lowerName.includes('gym')) {
    return `${basePrompt}. Look for: gym equipment, workout clothes, exercise in progress, or fitness activity.`
  }
  
  if (lowerName.includes('read') || lowerName.includes('book')) {
    return `${basePrompt}. Look for: an open book, e-reader, or reading material being actively read.`
  }
  
  if (lowerName.includes('meditat')) {
    return `${basePrompt}. Look for: meditation posture, calm environment, or meditation app/timer.`
  }
  
  if (lowerName.includes('cook') || lowerName.includes('meal prep')) {
    return `${basePrompt}. Look for: cooking in progress, ingredients, or prepared food.`
  }
  
  if (lowerName.includes('clean')) {
    return `${basePrompt}. Look for: cleaning supplies, tidy space, or cleaning in progress.`
  }
  
  if (lowerName.includes('water') || lowerName.includes('hydrat')) {
    return `${basePrompt}. Look for: water bottle, glass of water, or drinking water.`
  }
  
  if (lowerName.includes('run') || lowerName.includes('jog')) {
    return `${basePrompt}. Look for: running shoes, outdoor/treadmill setting, or fitness tracker showing run.`
  }
  
  if (lowerName.includes('yoga')) {
    return `${basePrompt}. Look for: yoga mat, yoga pose, or yoga class/video.`
  }

  return basePrompt
}
