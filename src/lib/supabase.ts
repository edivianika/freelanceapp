import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vejrtxoptwdugqqynsij.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlanJ0eG9wdHdkdWdxcXluc2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODY2MjYsImV4cCI6MjA3Mjk2MjYyNn0.xzUHOczvKvGADrxJysP7jFs3ai3mhWLeMPczIierFN0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlanJ0eG9wdHdkdWdxcXluc2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM4NjYyNiwiZXhwIjoyMDcyOTYyNjI2fQ.TqfWkGnfg9KeWX61iJPEZ3NwgMHQjTNKBA0iT9uZwzA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
