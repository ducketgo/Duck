'use client';

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { getFirebaseAuth } from '@/lib/firebase/client';

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        accessToken: async () => {
          const user = getFirebaseAuth().currentUser;
          return user ? user.getIdToken() : null;
        },
      },
    );
  }
  return browserClient;
}
