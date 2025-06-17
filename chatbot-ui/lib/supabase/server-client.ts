import { createClient as createServerSupabaseClient } from "@supabase/supabase-js"

export const supabase = createServerSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)