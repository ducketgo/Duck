'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Supabase completes the e-mail confirmation before redirecting here.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login?state=verified');
  }, [router]);

  return <div className="auth-wrap"><section className="auth-card"><p role="status">Vérification de l’adresse…</p></section></div>;
}
