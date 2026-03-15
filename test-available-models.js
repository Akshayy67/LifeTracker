// Check what models are actually available
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

async function listAvailableModels() {
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('🔍 Fetching available models...\n')
  
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
    
    console.log('✅ Available Models:\n')
    
    if (data.models) {
      const textModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        !m.name.includes('vision') && !m.name.includes('pro-latest')
      )
      
      const visionModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        (m.name.includes('vision') || m.name.includes('1.5'))
      )
      
      console.log('📝 Text Models:')
      textModels.forEach(model => {
        console.log(`   ${model.name} - ${model.displayName}`)
      })
      
      console.log('\n👁️ Vision Models:')
      visionModels.forEach(model => {
        console.log(`   ${model.name} - ${model.displayName}`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

listAvailableModels()
