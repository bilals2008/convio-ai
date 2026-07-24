import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const AVATAR_BUCKET = 'avatars'

export function useAgentAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = async (orgId: string, file: File) => {
    setIsUploading(true)
    setProgress(0)

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `agents/${orgId}/${crypto.randomUUID()}.${ext}`

      setProgress(10)

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      setProgress(50)

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath)

      setProgress(100)

      return publicUrlData.publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setProgress(0)
    setIsUploading(false)
  }

  return { upload, isUploading, progress, reset }
}