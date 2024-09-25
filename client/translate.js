#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, 'public', 'locales');
const SOURCE_FILE = path.join(LOCALES_DIR, 'translatable-strings.json');

// Get API key from multiple sources
function getApiKey() {
  // 1. Command line argument: npm run translate -- --api-key=sk-...
  const cliKeyArg = process.argv.find(arg => arg.startsWith('--api-key='));
  if (cliKeyArg) {
    return cliKeyArg.split('=')[1];
  }
  
  // 2. Environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // 3. .env file
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY\s*=\s*(.+)/);
    if (match) {
      return match[1].replace(/['"]/g, '').trim();
    }
  }
  
  return null;
}

// Target languages
const TARGET_LANGUAGES = {
  'es': 'Spanish',
  'fr': 'French', 
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'ar': 'Arabic',
  'hi': 'Hindi'
};

async function translateText(text, targetLanguage, apiKey) {

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text to ${targetLanguage}. 
                   Keep technical terms like "VeetAI" unchanged. Maintain the same tone and style.
                   Return only the translation, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function translateStrings() {
  console.log('🌐 Starting AI translation process...\n');

  // Get API key
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('❌ OpenAI API key is required. You can provide it in several ways:\n');
    console.error('1. Command line: npm run translate -- --api-key=sk-your-key-here');
    console.error('2. Environment: export OPENAI_API_KEY=sk-your-key-here');
    console.error('3. Create .env file with: OPENAI_API_KEY=sk-your-key-here\n');
    console.error('Get your API key at: https://platform.openai.com/api-keys');
    process.exit(1);
  }

  console.log('🔑 API key found and loaded');

  // Load source strings
  const sourceStrings = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  console.log(`📖 Loaded ${Object.keys(sourceStrings).length} source strings`);

  // Create English version
  fs.writeFileSync(
    path.join(LOCALES_DIR, 'en.json'),
    JSON.stringify(sourceStrings, null, 2)
  );
  console.log('✅ Created en.json');

  // Translate to each target language
  for (const [langCode, langName] of Object.entries(TARGET_LANGUAGES)) {
    console.log(`\n🔄 Translating to ${langName} (${langCode})...`);
    
    const translations = {};
    
    for (const [key, value] of Object.entries(sourceStrings)) {
      try {
        console.log(`   • ${key}: "${value}"`);
        const translated = await translateText(value, langName, apiKey);
        translations[key] = translated;
        console.log(`   → "${translated}"`);
        
        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Failed to translate "${key}": ${error.message}`);
        translations[key] = value; // Fallback to original
      }
    }

    // Save translation file
    const outputFile = path.join(LOCALES_DIR, `${langCode}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(translations, null, 2));
    console.log(`✅ Created ${langCode}.json`);
  }

  console.log('\n🎉 Translation complete! Generated files:');
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  files.forEach(file => console.log(`   • ${file}`));
}

// Run translation
translateStrings().catch(error => {
  console.error('❌ Translation failed:', error.message);
  process.exit(1);
});