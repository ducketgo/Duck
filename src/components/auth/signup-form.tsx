'use client';

import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from 'firebase/auth';
import Link from 'next/link';
import { getFirebaseAuth, ensureSupabaseClaims } from '@/lib/firebase/client';
import { withBasePath } from '@/lib/supabase/config';

export function SignupForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get('firstName') ?? '').trim();
    const lastName = String(data.get('lastName') ?? '').trim();
    const username = String(data.get('username') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: `${firstName} ${lastName}`.trim() });
      await ensureSupabaseClaims(credential.user, { acceptedTerms: true, username });
      await sendEmailVerification(credential.user, { url: `${window.location.origin}${withBasePath('/auth/login?state=verified')}` });
      await signOut(auth);
      setMessage('Compte créé. Consulte ta boîte e-mail et confirme ton adresse avant la première connexion.');
      form.reset();
    } catch {
      setError('Inscription indisponible. Vérifie les paramètres Firebase, la fonction de claims et la validité des champs.');
    } finally { setBusy(false); }
  }

  return <form className="auth-form" onSubmit={submit}>
    <div className="field-grid"><label>Prénom<input name="firstName" autoComplete="given-name" required maxLength={40}/></label><label>Nom<input name="lastName" autoComplete="family-name" required maxLength={40}/></label></div>
    <label>Pseudonyme<input name="username" autoComplete="username" pattern="[a-zA-Z0-9_]{3,24}" required maxLength={24}/></label>
    <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Mot de passe<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/><small>8 caractères minimum.</small></label>
    <label className="check-label terms-check"><input type="checkbox" name="acceptTerms" required/><span>J’accepte les <Link href="/terms">conditions d’utilisation</Link> et reconnais avoir lu la <Link href="/privacy">politique de confidentialité</Link>.</span></label>
    {message && <div role="status" className="notice">{message}</div>}
    {error && <div role="alert" className="notice error">{error}</div>}
    <button className="button" type="submit" disabled={busy}>{busy ? 'Création…' : 'Créer mon compte'}</button>
  </form>;
}
