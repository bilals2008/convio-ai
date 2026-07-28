import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envRaw = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
const getEnv = (key) => { const m = envRaw.match(new RegExp(`^${key}=(.+)$`, 'm')); return m?.[1]?.trim() }

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY')
const AVATARS_DIR = resolve('C:\\Users\\muham\\Desktop\\convio-avatars-batch2')
const PRESETS_JSON = resolve(__dirname, '..', 'apps/web/src/lib/config/avatar-presets.json')

const BUCKET = 'avatars'
const STORAGE_URL = `${SUPABASE_URL}/storage/v1`

const CATEGORY_MAP = {
  'customer-service-rep': 'support',
  'help-desk-agent': 'support',
  'tech-support-specialist': 'support',
  'live-chat-agent': 'support',
  'sales-manager': 'business',
  'marketing-director': 'business',
  'business-analyst': 'business',
  'math-teacher': 'education',
  'science-tutor': 'education',
  'language-instructor': 'education',
  'career-coach': 'education',
  'project-manager': 'productivity',
  'executive-assistant': 'productivity',
  'meeting-scheduler': 'productivity',
  'workflow-automator': 'productivity',
}

const NAME_MAP = {
  'customer-service-rep': 'Customer Service Rep',
  'help-desk-agent': 'Help Desk Agent',
  'tech-support-specialist': 'Tech Support Specialist',
  'live-chat-agent': 'Live Chat Agent',
  'sales-manager': 'Sales Manager',
  'marketing-director': 'Marketing Director',
  'business-analyst': 'Business Analyst',
  'math-teacher': 'Math Teacher',
  'science-tutor': 'Science Tutor',
  'language-instructor': 'Language Instructor',
  'career-coach': 'Career Coach',
  'project-manager': 'Project Manager',
  'executive-assistant': 'Executive Assistant',
  'meeting-scheduler': 'Meeting Scheduler',
  'workflow-automator': 'Workflow Automator',
}

async function upload(buf, path) {
  const res = await fetch(`${STORAGE_URL}/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'content-type': 'image/png' },
    body: buf,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`${res.status}: ${t.slice(0, 150)}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

const files = readdirSync(AVATARS_DIR).filter(f => f.endsWith('.png')).sort()
console.log(`📁 ${files.length} avatars found\n`)

const urls = []

for (let i = 0; i < files.length; i++) {
  const buf = readFileSync(resolve(AVATARS_DIR, files[i]))
  const slug = files[i].replace(/^\d+-/, '').replace('.png', '')
  const path = `presets/${Date.now()}-${String(i).padStart(2, '0')}.png`
  const name = NAME_MAP[slug] || slug
  const category = CATEGORY_MAP[slug] || 'custom'

  process.stdout.write(`[${i + 1}/${files.length}] ${name} (${category})... `)
  try {
    const url = await upload(buf, path)
    urls.push({ name, url, category })
    console.log(`✅`)
  } catch (err) {
    console.log(`❌ ${err.message}`)
  }
}

if (urls.length === 0) { process.exit(1) }

const existing = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
const merged = [...existing, ...urls.map((u, i) => ({ id: existing.length + i + 1, ...u }))]
writeFileSync(PRESETS_JSON, JSON.stringify(merged, null, 2))
console.log(`\n✅ avatar-presets.json updated: ${urls.length} added (${merged.length} total)`)
