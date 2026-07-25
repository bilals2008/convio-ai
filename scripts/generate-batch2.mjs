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
if (!HF_KEY) { console.error('HUGGINGFACE_API_KEY not found'); process.exit(1) }

const MODEL = 'stabilityai/stable-diffusion-3-medium-diffusers'
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`
const OUT = resolve('C:\\Users\\muham\\Desktop\\convio-avatars-batch2')
mkdirSync(OUT, { recursive: true })

const AVATARS = [
  // Support
  { name: 'Customer Service Rep', category: 'support', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, female Customer Service Representative wearing headset, warm smile, professional blue shirt, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Help Desk Agent', category: 'support', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, male Help Desk Agent with glasses, friendly approachable expression, casual professional attire, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Tech Support Specialist', category: 'support', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, Tech Support Specialist with headset, casual hoodie, tech enthusiast look, confident smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie' },
  { name: 'Live Chat Agent', category: 'support', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, Live Chat Agent, female, friendly expression, professional polo shirt, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },

  // Business
  { name: 'Company CEO', category: 'business', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, confident male CEO in premium navy suit, power pose, authoritative yet friendly expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on suit' },
  { name: 'Sales Manager', category: 'business', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, charismatic Sales Manager in business suit, confident handshake pose, warm smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on suit' },
  { name: 'Marketing Director', category: 'business', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, creative Marketing Director, trendy blazer, glasses, modern professional look, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing' },
  { name: 'Business Analyst', category: 'business', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, analytical Business Analyst, glasses, smart casual outfit, holding tablet, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },

  // Education
  { name: 'Math Teacher', category: 'education', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, friendly Math Teacher, glasses, chalkboard background hint, warm smile, professional attire, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Science Tutor', category: 'education', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, enthusiastic Science Tutor, lab coat, safety goggles on head, friendly expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on lab coat' },
  { name: 'Language Instructor', category: 'education', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, multilingual Language Instructor, friendly warm smile, cultural scarf, professional yet approachable, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing' },
  { name: 'Career Coach', category: 'education', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, supportive Career Coach, professional blazer, encouraging expression, clipboard, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on blazer' },

  // Productivity
  { name: 'Project Manager', category: 'productivity', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, organized Project Manager, smart casual, holding tablet with checklist, focused friendly expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Executive Assistant', category: 'productivity', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, efficient Executive Assistant, professional blouse, headset, warm organized expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on clothing' },
  { name: 'Meeting Scheduler', category: 'productivity', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, friendly Meeting Scheduler, casual professional, holding calendar, smiling expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Workflow Automator', category: 'productivity', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, tech-savvy Workflow Automator, hoodie, gears and automation symbols in background, smart expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie' },

  // Developer/Custom
  { name: 'Cybersecurity Expert', category: 'developer', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, cybersecurity expert, dark hoodie, shield icon, serious focused expression, green code background hint, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie' },
  { name: 'Cloud Architect', category: 'developer', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, Cloud Architect, modern tech hoodie, cloud symbols, confident smile, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie' },
  { name: 'DevOps Engineer', category: 'developer', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, DevOps Engineer, casual t-shirt, infinity loop symbol, friendly expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on shirt' },
  { name: 'Blockchain Developer', category: 'developer', prompt: 'Pixar-quality 3D cartoon character portrait, head and shoulders, Blockchain Developer, modern hoodie, chain link symbol, tech enthusiast expression, soft studio lighting, ultra clean white background, premium SaaS mascot design, app icon style, small visible CONVIO text on hoodie' },
]

async function generate(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: prompt, parameters: { width: 768, height: 768 } }),
  })
  if (!res.ok) {
    const text = await res.text()
    if (res.status === 503 && text.includes('loading')) {
      console.log('  ⏳ Model loading, waiting 30s...')
      await new Promise(r => setTimeout(r, 30000))
      return generate(prompt)
    }
    throw new Error(`${res.status}: ${text.slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

console.log(`🎨 Generating ${AVATARS.length} avatars (batch 2) by category...\n`)

for (let i = 0; i < AVATARS.length; i++) {
  const a = AVATARS[i]
  const label = `${i + 1}/${AVATARS.length}`
  console.log(`[${label}] ${a.category.toUpperCase()} — ${a.name}`)
  try {
    const buf = await generate(a.prompt)
    const fileName = `${String(i + 1).padStart(2, '0')}-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
    writeFileSync(resolve(OUT, fileName), buf)
    console.log(`  ✅ ${fileName}`)
  } catch (err) {
    console.error(`  ❌ ${err.message}`)
  }
  if (i < AVATARS.length - 1) {
    const delay = 3000 + Math.random() * 2000
    await new Promise(r => setTimeout(r, delay))
  }
}

console.log(`\n✨ Done! ${AVATARS.length} avatars saved to ${OUT}`)
