// List available Gemini models
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

async function listModels() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('Fetching available Gemini models...\n')
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Error:', data)
      return
    }
    
    console.log('✅ Available models:\n')
    
    if (data.models) {
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`)
        console.log(`   Display Name: ${model.displayName}`)
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`)
        console.log(`   Vision: ${model.name.includes('vision') ? 'Yes' : 'No'}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

listModels()
