import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { isFirebaseAuthConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Mot de passe oublié' };
export default function ForgotPasswordPage() {
  return <div className="auth-wrap"><section className="auth-card"><span className="section-kicker">RÉCUPÉRATION FIREBASE</span><h1>On s’en occupe.</h1>
    {!isFirebaseAuthConfigured() ? <div className="notice">La configuration Web Firebase est incomplète.</div> : <><p>Saisis l’adresse e-mail liée au compte. Firebase enverra un lien de réinitialisation.</p><ForgotPasswordForm/></>}
    <p className="auth-foot"><Link href="/auth/login">Retour à la connexion</Link></p>
  </section></div>;
}
