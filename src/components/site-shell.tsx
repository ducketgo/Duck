'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isPublicRegistrationEnabled } from '@/lib/supabase/config';
import { SiteVisualProvider, useSiteVisualSettings } from '@/components/site-visual-provider';
import { DuckInteractiveGame } from '@/components/duck-interactive-game';

function SiteShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { settings } = useSiteVisualSettings();
  const registrationOpen = isPublicRegistrationEnabled();
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
          <Link className="nav-login" data-visual-hidden={!settings.showLoginLink} href="/auth/login">Espace membre</Link>
          <Link className="button button-small" data-visual-hidden={!settings.showSignupButton} href="/auth/signup">{registrationOpen ? 'Rejoindre DUCK' : 'Inscription bientôt'} <ArrowUpRight size={15}/></Link>
        </div>
      </nav>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    </header>
    <main>{children}</main>
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
