'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { ensureSupabaseClaims, getFirebaseAuth } from '@/lib/firebase/client';
import { syncFirebaseProfile } from '@/lib/firebase/profile';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) { router.replace('/auth/login'); return; }
      if (!currentUser.emailVerified) { await signOut(auth); router.replace('/auth/login?state=unverified'); return; }
      try {
        const token = await ensureSupabaseClaims(currentUser);
        await syncFirebaseProfile(currentUser);
        setIsAdmin(token.claims.admin === true);
        setUser(currentUser);
      } catch {
        await signOut(auth);
        router.replace('/auth/login?state=backend-unavailable');
      } finally { setLoading(false); }
    });
  }, [router]);

  if (loading || !user) return <div className="wrap page-wrap"><p role="status">Chargement du compte…</p></div>;
  const displayName = user.displayName || user.email || 'Membre DUCK';
  return <div className="wrap page-wrap dashboard-page"><span className="section-kicker">ESPACE MEMBRE · FIREBASE</span><h1 className="page-title">Bonjour,<br/><span>{displayName}.</span></h1><p className="page-lede">Ton identité est gérée par Firebase. Les données DUCK et les autorisations sont protégées dans Supabase.</p><div className="dashboard-grid"><article className="dashboard-tile"><LayoutDashboard/><h2>Ton bureau DUCK</h2><p>Les widgets, raccourcis et projets personnels seront ajoutés dans les prochaines étapes.</p></article><article className="dashboard-tile"><ShieldCheck/><h2>Compte et confidentialité</h2><p>{isAdmin ? 'Compte administrateur DUCK.' : 'Compte membre DUCK.'}</p><span className="account-email">{user.email}</span></article></div><div className="dashboard-actions"><Link href="/services" className="text-link">Explorer les services <ArrowUpRight size={16}/></Link><button className="button button-secondary" onClick={async () => { await signOut(getFirebaseAuth()); router.replace('/'); }}>Se déconnecter</button></div></div>;
}
