'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebaseAuth, ensureSupabaseClaims } from '@/lib/firebase/client';
import { syncFirebaseProfile } from '@/lib/firebase/profile';

const initialMessages: Record<string, string> = {
  verified: 'Adresse confirmée. Tu peux maintenant te connecter.',
  unverified: 'Confirme ton adresse depuis l’e-mail reçu avant de te connecter.',
  'backend-unavailable': 'La liaison Firebase/Supabase est temporairement indisponible.',
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
    let auth: ReturnType<typeof getFirebaseAuth> | null = null;
    try {
      auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, String(data.get('email')), String(data.get('password')));
      if (!credential.user.emailVerified) {
        await signOut(auth);
        setError('Confirme ton adresse depuis l’e-mail reçu avant de te connecter.');
        return;
      }
      const currentClaims = await credential.user.getIdTokenResult();
      if (!currentClaims.claims.terms_version) {
        if (data.get('acceptTerms') !== 'on') {
          await signOut(auth);
          setError('Pour terminer la configuration de ce compte, accepte les conditions et la politique de confidentialité.');
          return;
        }
        await ensureSupabaseClaims(credential.user, { acceptedTerms: true });
      } else {
        await ensureSupabaseClaims(credential.user);
      }
      await syncFirebaseProfile(credential.user);
      router.replace('/dashboard');
      router.refresh();
    } catch {
      if (auth?.currentUser) await signOut(auth);
      setError('Connexion impossible. Vérifie tes identifiants et la configuration Firebase/Supabase.');
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
