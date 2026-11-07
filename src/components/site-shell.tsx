'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isPublicRegistrationEnabled } from '@/lib/supabase/config';

const links = [
  { href: '/', label: 'Accueil' }, { href: '/services', label: 'Services' },
  { href: '/about', label: 'Qui sommes-nous ?' }, { href: '/software', label: 'Logiciels' }, { href: '/transfer', label: 'Transfert' },
  { href: '/journal', label: 'Journal' },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const registrationOpen = isPublicRegistrationEnabled();
  return <>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="DUCK, accueil"><span className="brand-mark">D</span><span>Duck<span className="brand-dot">.</span></span></Link>
      <nav className={cn('main-nav', open && 'nav-open')} aria-label="Navigation principale">
        {links.map(link => <Link key={link.href} onClick={() => setOpen(false)} className={cn('nav-link', pathname === link.href && 'active')} href={link.href}>{link.label}</Link>)}
        <div className="nav-actions"><Link className="nav-login" href="/auth/login">Espace membre</Link><Link className="button button-small" href="/auth/signup">{registrationOpen ? 'Rejoindre DUCK' : 'Inscription bientôt'} <ArrowUpRight size={15}/></Link></div>
      </nav>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">D</span><span>Duck<span className="brand-dot">.</span></span></Link><p>Apprendre, avancer et performer.</p><div className="footer-links"><Link href="/about">À propos</Link><Link href="/legal">Mentions légales</Link><Link href="/privacy">Confidentialité</Link><Link href="/terms">Conditions</Link><a href="mailto:duckdev-service@protonmail.com">Assistance</a></div><span>© {new Date().getFullYear()} DUCK · Projet communautaire</span></footer>
  </>;
}
