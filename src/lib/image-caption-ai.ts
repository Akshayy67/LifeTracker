import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function captionImage(imageBase64: string): Promise<string> {
  if (openai) {
    return await captionWithOpenAI(imageBase64)
  } else if (process.env.GEMINI_API_KEY) {
    return await captionWithGemini(imageBase64)
  } else {
    return 'Image uploaded (AI captioning not available)'
  }
}

async function captionWithOpenAI(imageBase64: string): Promise<string> {
  if (!openai) throw new Error('OpenAI not configured')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an image analysis assistant. Describe what you see in the image in 1-2 sentences. Focus on: environment, objects, activities, mood, and lifestyle indicators. Be specific and observant.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image briefly but specifically. What does it reveal about the person\'s day, environment, or lifestyle?'
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
      max_tokens: 150,
      temperature: 0.5,
    })

    return response.choices[0]?.message?.content || 'Unable to describe image'
  } catch (error) {
    console.error('OpenAI image caption error:', error)
    return 'Image uploaded (caption failed)'
  }
}

async function captionWithGemini(imageBase64: string): Promise<string> {
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
                text: 'Describe this image in 1-2 sentences. Focus on environment, objects, activities, and what it reveals about lifestyle.'
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
            temperature: 0.5,
            maxOutputTokens: 150,
          }
        }),
      }
    )

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to describe image'
  } catch (error) {
    console.error('Gemini image caption error:', error)
    return 'Image uploaded (caption failed)'
  }
}

export async function captionMultipleImages(imageUrls: string[]): Promise<string[]> {
  if (imageUrls.length === 0) {
    console.log('No images to caption')
    return []
  }

  console.log(`Captioning ${imageUrls.length} images...`)
  const captions = await Promise.all(
    imageUrls.map(async (url, index) => {
      console.log(`Captioning image ${index + 1}/${imageUrls.length}`)
      try {
        // Fetch image and convert to base64
        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const caption = await captionImage(base64)
        console.log(`Image ${index + 1} caption:`, caption.substring(0, 100))
        return caption
      } catch (error) {
        console.error(`Failed to caption image ${index + 1}:`, error)
        return 'Image uploaded (caption failed)'
        return 'Image description unavailable'
      }
    })
  )
  return captions
}
