'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Firebase handles the e-mail action code on its hosted handler. This static
// page keeps the legacy /auth/callback URL working on GitHub Pages.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login?state=verified');
  }, [router]);

  return <div className="auth-wrap"><section className="auth-card"><p role="status">Vérification de l’adresse…</p></section></div>;
}
