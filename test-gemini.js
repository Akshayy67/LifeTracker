// Quick test to verify Gemini API key works
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

async function testGemini() {
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('✅ Gemini API key found:', apiKey.substring(0, 10) + '...')
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello, I am working!" in JSON format: {"message": "your response"}'
            }]
          }]
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Gemini API Error:', data)
      return
    }
    
    console.log('✅ Gemini API Response:', data)
    console.log('\n✅ SUCCESS! Gemini is working correctly.')
  } catch (error) {
    console.error('❌ Error testing Gemini:', error.message)
  }
}

testGemini()
