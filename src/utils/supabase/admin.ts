import { createClient } from '@supabase/supabase-js'

// Use the service role key to bypass RLS for the admin dashboard
// Fallback to empty strings during build time to prevent "supabaseUrl is required" errors
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
