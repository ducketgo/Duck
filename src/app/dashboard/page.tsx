'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, FileUp, LayoutDashboard, Palette, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FOUNDER_EMAIL = 'duckdev-service@protonmail.com';
type DeskUser = { id: string; email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> };
type Profile = { username: string; first_name: string; last_name: string; bio: string | null; avatar_url: string | null; duck_points: number; role: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DeskUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace('/auth/login'); return; }
      if (!session.user.email_confirmed_at) {
        await supabase.auth.signOut(); router.replace('/auth/login?state=unverified'); return;
      }
      const { data } = await supabase.from('profiles').select('username, first_name, last_name, bio, avatar_url, duck_points, role').eq('id', session.user.id).maybeSingle();
      if (!active) return;
      setUser(session.user);
      setProfile(data as Profile | null);
      setLoading(false);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace('/auth/login');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router]);

  if (loading || !user) return <div className="wrap page-wrap"><p role="status">Chargement de ton DeskDuck…</p></div>;
  const firstName = profile?.first_name || (typeof user.user_metadata?.first_name === 'string' ? user.user_metadata.first_name : '');
  const displayName = [firstName, profile?.last_name || (typeof user.user_metadata?.last_name === 'string' ? user.user_metadata.last_name : '')].filter(Boolean).join(' ') || user.email || 'Membre DUCK';
  const isFounder = user.email?.toLowerCase() === FOUNDER_EMAIL;
  const isAdmin = isFounder || profile?.role === 'admin' || user.app_metadata?.duck_role === 'admin';

  return <div className="wrap page-wrap dashboard-page">
    <span className="section-kicker">DESKDUCK · TON ESPACE PERSONNEL</span>
    <h1 className="page-title">Bonjour,<br/><span>{displayName}.</span></h1>
    <p className="page-lede">Ton bureau DUCK rassemble ton compte, tes raccourcis et les espaces utiles pour avancer.</p>
    <section className="deskduck-welcome dashboard-tile" aria-label="Résumé du compte">
      {profile?.avatar_url ? <img className="deskduck-avatar" src={profile.avatar_url} alt=""/> : <span className="deskduck-avatar deskduck-avatar-fallback"><UserRound size={25}/></span>}
      <div><strong>{profile?.username ? `@${profile.username}` : displayName}</strong><p>{profile?.bio || (isAdmin ? 'Espace administrateur DUCK.' : 'Bienvenue dans ton espace personnel DUCK.')}</p></div>
      <span className="deskduck-points"><Sparkles size={15}/>{profile?.duck_points ?? 0} points</span>
    </section>
    <div className="dashboard-grid deskduck-grid">
      <Link href="/services" className="dashboard-tile deskduck-link"><LayoutDashboard/><h2>Explorer les services</h2><p>Retrouve les espaces et outils de l’écosystème DUCK.</p><span>Découvrir <ArrowUpRight size={15}/></span></Link>
      <Link href="/journal" className="dashboard-tile deskduck-link"><BookOpen/><h2>Journal DUCK</h2><p>Consulte les nouvelles et les publications du site.</p><span>Lire le journal <ArrowUpRight size={15}/></span></Link>
      <Link href="/transfer" className="dashboard-tile deskduck-link"><FileUp/><h2>Transfert de fichiers</h2><p>Prépare un lien temporaire pour partager un fichier.</p><span>Ouvrir le transfert <ArrowUpRight size={15}/></span></Link>
      <article className="dashboard-tile"><ShieldCheck/><h2>Compte et confidentialité</h2><p>{isAdmin ? 'Compte administrateur DUCK.' : 'Compte membre DUCK.'}</p><span className="account-email">{user.email}</span></article>
    </div>
    <div className="dashboard-actions"><Link href="/" className="text-link">Retour au site <ArrowUpRight size={16}/></Link><div className="dashboard-actions-right">
      {isAdmin && <Link className="button button-secondary" href="/admin">Gestion admin</Link>}
      {isFounder && <Link className="button" href="/admin/visual"><Palette size={16}/> Ouvrir DuckAdmin</Link>}
      <button className="button button-secondary" onClick={async () => { await createClient().auth.signOut(); router.replace('/'); }}>Se déconnecter</button>
    </div></div>
  </div>;
}
