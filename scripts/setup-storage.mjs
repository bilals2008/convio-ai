import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envRaw = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8')
const getEnv = (key) => { const m = envRaw.match(new RegExp(`^${key}=(.+)$`, 'm')); return m?.[1]?.trim() }

const pool = new pg.Pool({ connectionString: getEnv('DIRECT_URL') })

try {
  await pool.query(`
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, false, 5242880, '{image/png,image/jpeg,image/webp,image/gif}')
    ON CONFLICT (id) DO NOTHING;
  `)
  console.log('✅ Bucket "avatars" ready')

  // Drop existing policies on objects for this bucket to avoid conflicts
  await pool.query(`DROP POLICY IF EXISTS "anon insert avatars" ON storage.objects`)
  await pool.query(`DROP POLICY IF EXISTS "anon select avatars" ON storage.objects`)

  // Allow anonymous INSERT into avatars bucket
  await pool.query(`
    CREATE POLICY "anon insert avatars" ON storage.objects
      FOR INSERT TO anon
      WITH CHECK (bucket_id = 'avatars');
  `)
  console.log('✅ Anon INSERT policy created')

  // Allow anonymous SELECT from avatars bucket
  await pool.query(`
    CREATE POLICY "anon select avatars" ON storage.objects
      FOR SELECT TO anon
      USING (bucket_id = 'avatars');
  `)
  console.log('✅ Anon SELECT policy created')
} catch (err) {
  console.error('❌', err.message)
} finally {
  await pool.end()
}
