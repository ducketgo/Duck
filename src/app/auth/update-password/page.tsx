'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const confirmation = String(data.get('confirmation') ?? '');
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      setBusy(false);
      return;
    }
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError('Le lien a peut-être expiré. Demande un nouveau lien de réinitialisation.');
      setBusy(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return <div className="auth-wrap"><section className="auth-card"><span className="section-kicker">SÉCURITÉ SUPABASE</span><h1>Choisis un nouveau mot de passe.</h1><p>Saisis ton nouveau mot de passe pour terminer la réinitialisation.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Nouveau mot de passe<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/><small>8 caractères minimum.</small></label>
      <label>Confirmer le mot de passe<input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/></label>
      {error && <div role="alert" className="notice error">{error}</div>}
      <button className="button" type="submit" disabled={busy}>{busy ? 'Mise à jour…' : 'Enregistrer le mot de passe'}</button>
    </form>
    <p className="auth-foot"><Link href="/auth/login">Retour à la connexion</Link></p>
  </section></div>;
}
