import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { env } from "@rio.js/env"

export function createClient() {
  return createSupabaseClient(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
  )
}
