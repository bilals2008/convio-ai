import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const require = createRequire(import.meta.url)
const envPath = resolve(__dirname, '..', '.env')
const envContent = require('fs').readFileSync(envPath, 'utf-8')
const match = envContent.match(/^HUGGINGFACE_API_KEY=(.+)$/m)
const HF_KEY = match?.[1]
if (!HF_KEY) { console.error('HUGGINGFACE_API_KEY not found in .env'); process.exit(1) }

const MODEL = 'stabilityai/stable-diffusion-3-medium-diffusers'
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`
const OUT = resolve('C:\\Users\\muham\\Desktop\\convio-avatars')

mkdirSync(OUT, { recursive: true })

const PROMPTS = [
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Business Professional in navy suit with glasses, friendly smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on blazer',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Startup Founder in modern blazer, confident smile, entrepreneur appearance, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on jacket',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Software Developer in dark hoodie with glasses, tech enthusiast look, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, AI Engineer in futuristic hoodie with smart glasses, modern tech appearance, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on chest',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Customer Support Agent with headset microphone, professional shirt, welcoming smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Sales Representative in business casual polo shirt, confident smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Marketing Specialist in trendy blazer, modern appearance, creative professional, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, UI/UX Designer with stylish glasses, creative outfit, modern startup vibe, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Product Manager in smart casual outfit, professional appearance, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Data Scientist with glasses, tech hoodie, analytical look, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on chest',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Teacher educator appearance in sweater, warm smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Healthcare Assistant in clean medical uniform, approachable smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on uniform',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Financial Advisor in elegant suit with glasses, trustworthy appearance, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on blazer',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Lawyer in premium business suit, professional expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on suit',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, HR Manager in approachable business casual outfit, friendly smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Content Creator in modern casual hoodie, energetic personality, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Gamer with gaming headset, stylish hoodie, energetic expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Student in casual hoodie, youthful appearance, friendly smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on chest',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, cute futuristic humanoid AI robot assistant with glowing accents, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on chest panel',
  'Pixar-quality 3D cartoon character portrait, head and shoulders, Female Support Specialist with headset microphone, professional attire, friendly smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt',
]

async function generate(label, prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt, parameters: { width: 768, height: 768 } }),
  })
  if (!res.ok) {
    const text = await res.text()
    if (res.status === 503 && text.includes('loading')) {
      console.log(`  ⏳ Model loading, waiting 30s...`)
      await new Promise(r => setTimeout(r, 30000))
      return generate(label, prompt)
    }
    throw new Error(`${res.status}: ${text.slice(0, 200)}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const name = String(label).padStart(2, '0')
  const path = resolve(OUT, `${name}.png`)
  writeFileSync(path, buf)
  console.log(`  ✅ Saved: ${path.split('\\').pop()}`)
}

console.log('🎨 Generating 20 Convio avatars...')
console.log(`📁 Output: ${OUT}`)
console.log(`🤖 Model: ${MODEL}\n`)

for (let i = 0; i < PROMPTS.length; i++) {
  const label = `${i + 1}`
  const name = PROMPTS[i].split(',')[0].replace('Pixar-quality 3D cartoon character portrait, head and shoulders, ', '').trim()
  console.log(`[${label}/${PROMPTS.length}] ${name}`)
  try {
    await generate(i + 1, PROMPTS[i])
  } catch (err) {
    console.error(`  ❌ ${err.message}`)
  }
  if (i < PROMPTS.length - 1) {
    const delay = 3000 + Math.random() * 2000
    console.log(`  ⏱  Waiting ${Math.round(delay / 1000)}s...\n`)
    await new Promise(r => setTimeout(r, delay))
  }
}

console.log(`\n✨ Done! Check ${OUT}`)
