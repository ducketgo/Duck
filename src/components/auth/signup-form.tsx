'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();
    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login?state=verified`,
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
            accepted_terms: true,
            terms_version: '2026-11-07-v1',
            is_profile_public: false,
          },
        },
      });
      if (signUpError || !userData.user) throw signUpError ?? new Error('Inscription impossible.');
      setMessage('Compte créé. Vérifie ta boîte e-mail pour confirmer ton adresse avant la première connexion.');
      form.reset();
    } catch {
      setError('Inscription indisponible. Vérifie les paramètres Supabase et la validité des champs.');
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
