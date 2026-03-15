// Test new Gemini 2.5 models
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

async function testGeminiNew() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('✅ Gemini API key found:', apiKey.substring(0, 10) + '...')
  
  // Test gemini-2.5-pro
  console.log('\n🧪 Testing gemini-2.5-pro...')
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello from Gemini 2.5 Pro!" in JSON format: {"message": "your response"}'
            }]
          }]
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ gemini-2.5-pro works!')
      console.log('Response:', text)
    } else {
      const error = await response.json()
      console.error('❌ gemini-2.5-pro failed:', error)
    }
  } catch (error) {
    console.error('❌ gemini-2.5-pro error:', error.message)
  }

  // Test gemini-2.5-flash
  console.log('\n🧪 Testing gemini-2.5-flash...')
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello from Gemini 2.5 Flash!" in JSON format: {"message": "your response"}'
            }]
          }]
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ gemini-2.5-flash works!')
      console.log('Response:', text)
    } else {
      const error = await response.json()
      console.error('❌ gemini-2.5-flash failed:', error)
    }
  } catch (error) {
    console.error('❌ gemini-2.5-flash error:', error.message)
  }

  // Test gemini-1.5-pro-latest (vision)
  console.log('\n🧪 Testing gemini-1.5-pro-latest (vision)...')
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello from Gemini 1.5 Pro Vision!" in JSON format: {"message": "your response"}'
            }]
          }]
        })
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      console.log('✅ gemini-1.5-pro-latest works!')
      console.log('Response:', text)
    } else {
      const error = await response.json()
      console.error('❌ gemini-1.5-pro-latest failed:', error)
    }
  } catch (error) {
    console.error('❌ gemini-1.5-pro-latest error:', error.message)
  }
}

testGeminiNew()
