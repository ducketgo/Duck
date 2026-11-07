import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { isSupabaseAuthConfigured, isPublicRegistrationEnabled } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Créer un compte' };
export default function SignupPage() {
  return <div className="auth-wrap"><section className="auth-card"><span className="section-kicker">REJOINDRE DUCK</span><h1>Bienvenue dans l’aventure.</h1>
    {!isSupabaseAuthConfigured() ? <div className="notice">La configuration Supabase est incomplète.</div> : !isPublicRegistrationEnabled() ? <><p>Les inscriptions publiques sont fermées pour le moment.</p><div className="notice">Les comptes existants peuvent se connecter via Supabase Auth. Consulte les <Link href="/terms">conditions</Link> et la <Link href="/privacy">politique de confidentialité</Link>.</div></> : <><p>Un compte Supabase pour accéder aux services DUCK. La confirmation de l’adresse e-mail est requise.</p><SignupForm/></>}
    <p className="auth-foot">Déjà membre ? <Link href="/auth/login">Se connecter</Link></p>
  </section></div>;
}
