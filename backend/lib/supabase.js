import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables. ' +
      'Database features will be disabled until these are set.'
  )
}

/**
 * Supabase client for server-side usage in our Node.js backend.
 * We use the public anon key because we access only the public schema
 * with row-level security disabled for this simple student project.
 */
export const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
        },
      })
    : null