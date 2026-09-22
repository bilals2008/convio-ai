import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Passkeys are opt-in while Supabase marks the feature experimental; every
    // passkey call fails with `passkey_disabled` without this flag. The server
    // side must also be enabled in Auth → Passkeys.
    experimental: { passkey: true },
  },
})
