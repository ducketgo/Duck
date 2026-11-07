import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createPlatformPublicClient() {
  const url = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}