import { createClient } from '@supabase/supabase-js'

const BUCKET = process.env.STORAGE_BUCKET || 'convio'

let storageClient: ReturnType<typeof createClient> | null = null

function getAdminClient() {
  if (!storageClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for file storage')
    }
    storageClient = createClient(url, key, { auth: { persistSession: false } })
  }
  return storageClient
}

async function ensureBucket() {
  const client = getAdminClient()
  const { data: buckets } = await client.storage.listBuckets()
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await client.storage.createBucket(BUCKET, { public: false })
  }
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  await ensureBucket()
  const client = getAdminClient()
  const filePath = `documents/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error } = await client.storage.from(BUCKET).upload(filePath, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return filePath
}

export async function getFileUrl(fileKey: string): Promise<string> {
  const client = getAdminClient()
  const { data } = client.storage.from(BUCKET).getPublicUrl(fileKey)
  return data.publicUrl
}

export async function downloadFile(fileKey: string): Promise<Buffer> {
  const client = getAdminClient()
  const { data, error } = await client.storage.from(BUCKET).download(fileKey)
  if (error) throw new Error(`Storage download failed: ${error.message}`)
  return Buffer.from(await data.arrayBuffer())
}

export async function deleteFile(fileKey: string): Promise<void> {
  const client = getAdminClient()
  await client.storage.from(BUCKET).remove([fileKey])
}
