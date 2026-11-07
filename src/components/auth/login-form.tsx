'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const initialMessages: Record<string, string> = {
  verified: 'Adresse confirmée. Tu peux maintenant te connecter.',
  unverified: 'Confirme ton adresse depuis l’e-mail reçu avant de te connecter.',
  'backend-unavailable': 'Le service d’authentification Supabase est temporairement indisponible.',
};

export function LoginForm() {
  const router = useRouter();
  const [queryState, setQueryState] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQueryState(new URLSearchParams(window.location.search).get('state') ?? '');
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const supabase = createClient();
    try {
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !sessionData.user) throw signInError ?? new Error('Connexion impossible.');
      if (!sessionData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Confirme ton adresse depuis l’e-mail reçu avant de te connecter.');
        return;
      }
      const acceptedTerms = sessionData.user.user_metadata?.accepted_terms === true || sessionData.user.user_metadata?.terms_version === '2026-11-07-v1';
      if (!acceptedTerms && data.get('acceptTerms') !== 'on') {
        await supabase.auth.signOut();
        setError('Pour terminer la configuration de ce compte, accepte les conditions et la politique de confidentialité.');
        return;
      }
      if (!acceptedTerms) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { accepted_terms: true, terms_version: '2026-11-07-v1' },
        });
        if (updateError) throw updateError;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Connexion impossible. Vérifie tes identifiants et la configuration Supabase.');
    } finally { setBusy(false); }
  }

  const initialMessage = initialMessages[queryState] ?? '';
  const notice = error || initialMessage;
  const isStatus = !error && queryState === 'verified';

  return <form className="auth-form" onSubmit={submit}>
    <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128}/></label>
    <label className="check-label terms-check"><input type="checkbox" name="acceptTerms"/><span>Si ce compte n’a pas encore enregistré son acceptation, j’accepte les <Link href="/terms">conditions d’utilisation</Link> et reconnais avoir lu la <Link href="/privacy">politique de confidentialité</Link>.</span></label>
    {notice && <div role={isStatus ? 'status' : 'alert'} className={`notice ${isStatus ? '' : 'error'}`}>{notice}</div>}
    <button className="button" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
  </form>;
}
