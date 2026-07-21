import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUpdateProfile } from '@/lib/hooks/use-profile'

const AVATAR_BUCKET = 'avatars'

async function syncAuthMetadata(avatarUrl: string) {
  const { error } = await supabase.auth.updateUser({
    data: { avatar: avatarUrl },
  })
  if (error) throw error
}

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const updateProfile = useUpdateProfile()

  const upload = async (userId: string, file: File) => {
    setIsUploading(true)
    setProgress(0)

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`

      setProgress(10)

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      setProgress(50)

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath)

      const avatarUrl = publicUrlData.publicUrl

      setProgress(65)

      await updateProfile.mutateAsync({ avatar: avatarUrl })

      setProgress(85)

      await syncAuthMetadata(avatarUrl)

      setProgress(100)

      return avatarUrl
    } finally {
      setIsUploading(false)
    }
  }

  const saveUrl = async (url: string) => {
    setIsUploading(true)
    setProgress(30)

    try {
      await updateProfile.mutateAsync({ avatar: url })

      setProgress(60)

      await syncAuthMetadata(url)

      setProgress(100)

      return url
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setProgress(0)
    setIsUploading(false)
  }

  return { upload, saveUrl, isUploading, progress, reset }
}
