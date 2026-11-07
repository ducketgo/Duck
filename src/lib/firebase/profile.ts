'use client';

import type { User } from 'firebase/auth';
import { createClient } from '@/lib/supabase/client';

export async function syncFirebaseProfile(user: User) {
  const { claims } = await user.getIdTokenResult();
  const { error } = await createClient().from('duck_profiles').upsert({
    firebase_uid: user.uid,
    username: typeof claims.username === 'string' ? claims.username : null,
    display_name: user.displayName?.trim().slice(0, 80) || user.email?.split('@')[0]?.slice(0, 80) || 'Membre',
    avatar_url: user.photoURL || null,
    terms_version: typeof claims.terms_version === 'string' ? claims.terms_version : null,
    terms_accepted_at: typeof claims.terms_accepted_at === 'string' ? claims.terms_accepted_at : null,
  }, { onConflict: 'firebase_uid' });
  if (error) throw new Error('Le profil Supabase est indisponible. Vérifie l’intégration Firebase et les règles RLS.');
}
