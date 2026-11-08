'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isPublicRegistrationEnabled } from '@/lib/supabase/config';
import { SiteVisualProvider, useSiteVisualSettings } from '@/components/site-visual-provider';
import { DuckInteractiveGame } from '@/components/duck-interactive-game';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { SitePageEditor } from '@/components/site-page-editor';

const FOUNDER_EMAIL = 'duckdev-service@protonmail.com';

function SiteShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { settings } = useSiteVisualSettings();
  const registrationOpen = isPublicRegistrationEnabled();

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => { setAccountOpen(false); }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  async function signOut() {
    setLoggingOut(true);
    setLogoutError('');
    const { error } = await createClient().auth.signOut();
    setLoggingOut(false);
    if (error) { setLogoutError('La déconnexion a échoué. Réessaie.'); return; }
    setAccountOpen(false);
    setOpen(false);
    router.replace('/');
    router.refresh();
  }

  const accountName = typeof user?.user_metadata?.first_name === 'string'
    ? user.user_metadata.first_name
    : user?.email?.split('@')[0] || 'Mon compte';
  const links = [
    { href: '/', label: settings.navHomeLabel },
    { href: '/services', label: settings.navServicesLabel },
    { href: '/about', label: settings.navAboutLabel },
    { href: '/software', label: settings.navSoftwareLabel },
    { href: '/transfer', label: settings.navTransferLabel },
    { href: '/journal', label: settings.navJournalLabel },
  ];

  return <>
    <header className="site-header" data-compact={Number(settings.headerHeight) < 64 ? 'yes' : 'no'}>
      <Link className="brand" href="/" aria-label={`${settings.brandName}, accueil`}>
        <span className="brand-mark" data-visual-hidden={!settings.showBrandMark}>{settings.brandMark}</span>
        <span>{settings.brandName}<span className="brand-dot">.</span></span>
      </Link>
      <nav className={cn('main-nav', open && 'nav-open')} aria-label="Navigation principale" data-active-underline={settings.activeNavUnderline ? 'yes' : 'no'}>
        {links.map(link => <Link key={link.href} onClick={() => setOpen(false)} className={cn('nav-link', pathname === link.href && 'active')} href={link.href}>{link.label}</Link>)}
        <div className="nav-actions">
          {user ? <div className="nav-account" ref={accountRef}>
            <button className="nav-account-trigger" type="button" aria-expanded={accountOpen} aria-haspopup="menu" onClick={() => { setAccountOpen(value => !value); setLogoutError(''); }}>
              <span className="nav-account-avatar" aria-hidden="true">{accountName.slice(0, 1).toUpperCase() || <UserRound size={15}/>}</span>
              <span className="nav-account-name">{accountName}</span><ChevronDown size={14}/>
            </button>
            {accountOpen && <div className="nav-account-menu" role="menu" aria-label="Menu du compte">
              <Link href="/dashboard" role="menuitem" onClick={() => { setAccountOpen(false); setOpen(false); }}>Mon DeskDuck</Link>
              {logoutError && <span className="nav-account-error" role="alert">{logoutError}</span>}
              <button type="button" role="menuitem" onClick={() => void signOut()} disabled={loggingOut}><LogOut size={15}/>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</button>
            </div>}
          </div> : <>
            <Link className="nav-login" data-visual-hidden={!settings.showLoginLink} href="/auth/login">Espace membre</Link>
            <Link className="button button-small" data-visual-hidden={!settings.showSignupButton} href="/auth/signup">{registrationOpen ? 'Rejoindre DUCK' : 'Inscription bientôt'} <ArrowUpRight size={15}/></Link>
          </>}
        </div>
      </nav>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    </header>
    <main><SitePageEditor pathname={pathname} isFounder={user?.email?.toLowerCase() === FOUNDER_EMAIL}>{children}</SitePageEditor></main>
    <DuckInteractiveGame />
    <footer className="site-footer" data-visual-hidden={!settings.showFooter}>
      <Link className="brand footer-brand" href="/">
        <span className="brand-mark" data-visual-hidden={!settings.showBrandMark}>{settings.brandMark}</span>
        <span>{settings.brandName}<span className="brand-dot">.</span></span>
      </Link>
      <p>Apprendre, avancer et performer.</p>
      <div className="footer-links"><Link href="/about">À propos</Link><Link href="/legal">Mentions légales</Link><Link href="/privacy">Confidentialité</Link><Link href="/terms">Conditions</Link><a href="mailto:duckdev-service@protonmail.com">Assistance</a></div>
      <span>© {new Date().getFullYear()} {settings.brandName} · Projet communautaire</span>
    </footer>
  </>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <SiteVisualProvider><SiteShellContent>{children}</SiteShellContent></SiteVisualProvider>;
}
