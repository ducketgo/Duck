'use client';

import { useState, type FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { withBasePath } from '@/lib/supabase/config';

export function ForgotPasswordForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage(''); setError('');
    const email = String(new FormData(form).get('email') ?? '').trim();
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email, { url: `${window.location.origin}${withBasePath('/auth/login')}` });
      setMessage('Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé.');
      form.reset();
    } catch { setError('Le service de récupération est temporairement indisponible.'); }
    finally { setBusy(false); }
  }
  return <form className="auth-form" onSubmit={submit}>
    <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    {message && <div role="status" className="notice">{message}</div>}
    {error && <div role="alert" className="notice error">{error}</div>}
    <button className="button" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer le lien sécurisé'}</button>
  </form>;
}
