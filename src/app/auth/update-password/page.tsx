import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Nouveau mot de passe' };
export default function UpdatePasswordPage() {
  return <div className="auth-wrap"><section className="auth-card"><span className="section-kicker">SÉCURITÉ FIREBASE</span><h1>Réinitialise ton mot de passe.</h1><p>Ouvre le lien reçu de Firebase et suis les étapes sur la page sécurisée de confirmation. Une fois terminé, connecte-toi avec ton nouveau mot de passe.</p><p className="auth-foot"><Link href="/auth/login">Retour à la connexion</Link></p></section></div>;
}
