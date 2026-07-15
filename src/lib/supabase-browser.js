import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
