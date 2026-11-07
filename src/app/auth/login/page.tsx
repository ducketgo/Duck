import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { isSupabaseAuthConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Connexion' };
export default function LoginPage() {
  return <div className="auth-wrap"><section className="auth-card"><span className="section-kicker">DUCKAUTH · SUPABASE</span><h1>Content de te revoir.</h1><p>Connecte-toi à ton identité DUCK.</p>
    {!isSupabaseAuthConfigured() ? <div className="notice">La configuration Supabase est incomplète.</div> : <LoginForm/>}
    <p className="auth-foot"><Link href="/auth/forgot-password">Mot de passe oublié ?</Link></p><p className="auth-foot">Nouveau sur DUCK ? <Link href="/auth/signup">Créer un compte</Link></p>
  </section></div>;
}
