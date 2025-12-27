import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para uso no cliente (browser)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Cliente Supabase para uso no servidor (com service role key)
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Please check your .env.local file.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Tipos para as tabelas (ajuste conforme suas tabelas)
export type VideoProject = {
  id: string
  user_id: string | null
  title: string
  description: string | null
  script: any // JSONB
  clips: any // JSONB
  created_at: string
  updated_at: string
}

export type SavedViralVideo = {
  id: string
  user_id: string | null
  video_id: string
  platform: string
  title: string | null
  metadata: any // JSONB
  saved_at: string
}



