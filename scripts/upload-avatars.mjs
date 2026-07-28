import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envRaw = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
const getEnv = (key) => { const m = envRaw.match(new RegExp(`^${key}=(.+)$`, 'm')); return m?.[1]?.trim() }

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY')
const AVATARS_DIR = resolve('C:\\Users\\muham\\Desktop\\convio-avatars')
const PRESETS_JSON = resolve(__dirname, '..', 'apps/web/src/lib/config/avatar-presets.json')

const BUCKET = 'avatars'
const STORAGE_URL = `${SUPABASE_URL}/storage/v1`

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

const names = [
  'Business Professional','Startup Founder','Software Developer','AI Engineer',
  'Customer Support Agent','Sales Representative','Marketing Specialist','UI/UX Designer',
  'Product Manager','Data Scientist','Teacher','Healthcare Assistant',
  'Financial Advisor','Lawyer','HR Manager','Content Creator',
  'Gamer','Student','AI Robot Assistant','Female Support Specialist',
]

const urls = []

for (let i = 0; i < files.length; i++) {
  const buf = readFileSync(resolve(AVATARS_DIR, files[i]))
  const path = `presets/${Date.now()}-${String(i).padStart(2, '0')}.png`
  process.stdout.write(`[${i+1}/${files.length}] ${names[i]}... `)
  try {
    const url = await upload(buf, path)
    urls.push({ name: names[i], url, category: 'custom' })
    console.log(`✅`)
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('bucket')) {
      console.log(`\n❌ Bucket "${BUCKET}" doesn't exist or anon key can't upload.`)
      console.log(`👉 Go to ${SUPABASE_URL}/project/xgarixfzlhmjtfuuhwpk/storage/buckets`)
      console.log(`   Create a public bucket named "avatars", then run this script again.\n`)
      process.exit(1)
    }
    console.log(`❌ ${err.message}`)
  }
}

if (urls.length === 0) { process.exit(1) }

const existing = JSON.parse(readFileSync(PRESETS_JSON, 'utf-8'))
const merged = [...existing, ...urls.map((u, i) => ({ id: existing.length + i + 1, ...u }))]
writeFileSync(PRESETS_JSON, JSON.stringify(merged, null, 2))
console.log(`\n✅ avatar-presets.json updated: ${urls.length} added (${merged.length} total)`)
