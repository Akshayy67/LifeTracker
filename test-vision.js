// Test if gemini-2.5-flash supports images
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '.env.local')
let apiKey = null

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/GEMINI_API_KEY=(.+)/)
  if (match) {
    apiKey = match[1].trim()
  }
}

async function testVisionSupport() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('🧪 Testing gemini-2.5-flash with image support...\n')
  
  // Create a simple 1x1 pixel PNG (base64)
  const tinyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'What do you see in this image? Respond with JSON: {"seen": "description"}'
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: tinyImage
                }
              }
            ]
          }]
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ gemini-2.5-flash supports images!')
      console.log('Response:', text)
    } else {
      const error = await response.json()
      console.error('❌ gemini-2.5-flash vision failed:', error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testVisionSupport()
