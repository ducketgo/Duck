'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Box, Code2, Compass, Gamepad2, Globe2, ShieldCheck, Users } from 'lucide-react';
import { useSiteVisualSettings } from '@/components/site-visual-provider';

const branches = [
  { icon: Code2, name: 'DuckDev', text: 'Construire et faire grandir les outils de l’écosystème.', color: 'cyan', href: '/services/duckdev' },
  { icon: AudioLines, name: 'DjDuck', text: 'Un espace pour la musique, les idées et la création.', color: 'violet', href: '/services/djduck' },
  { icon: Box, name: 'DuckOS', text: 'Explorer une vision accessible du système d’exploitation.', color: 'green', href: '/services/duckos' },
  { icon: Globe2, name: 'DuckWeb', text: 'Des services web utiles, ouverts et reliés entre eux.', color: 'cyan', href: '/services/duckweb' },
  { icon: Users, name: 'DuckCommunity', text: 'Apprendre, échanger et créer avec la communauté.', color: 'violet', href: '/services/duckcommunity' },
  { icon: ShieldCheck, name: 'DuckAuth', text: 'Une identité commune, avec la confidentialité en priorité.', color: 'green', href: '/services/duckauth' },
];

export default function HomePage() {
  const { settings } = useSiteVisualSettings();
  return <>
    <section className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot"/> {settings.heroEyebrow}</div>
        <h1>{settings.heroTitleLine1}<br/><span>{settings.heroTitleLine2}</span></h1>
        <p className="hero-lede">{settings.heroDescription}</p>
        <div className="hero-actions"><Link className="button" href={String(settings.heroPrimaryHref)}>{settings.heroPrimaryLabel} <ArrowRight size={17}/></Link><Link className="text-link" href="/about">{settings.heroSecondaryLabel} <ArrowUpRight size={16}/></Link></div>
        <div className="hero-note" data-visual-hidden={!settings.showHeroNote}><span className="note-line"/> Une initiative ouverte portée par sa communauté</div>
      </div>
      <div className="hero-art" data-visual-hidden={!settings.showHeroArtwork} aria-label="Illustration abstraite de l’univers DUCK"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="hero-core"><div className="duck-symbol">D</div><span>DUCK<br/><small>COMMUNITY SYSTEM</small></span></div><span className="orbit-node node-a"><Code2 size={18}/></span><span className="orbit-node node-b"><AudioLines size={18}/></span><span className="orbit-node node-c"><Users size={18}/></span><span className="orbit-node node-d"><Globe2 size={18}/></span><span className="art-caption">UN UNIVERS. PLUSIEURS POSSIBILITÉS.</span></div>
      <Link className="scroll-cue" href="#ecosysteme" aria-label="Découvrir l’écosystème"><ArrowDownRight size={17}/></Link>
    </section>
    <section className="intro-band" data-visual-hidden={!settings.showIntroSection}><div className="wrap intro-inner"><span className="section-kicker">{settings.introLabel}</span><p>{settings.introText}</p><Compass className="intro-icon" strokeWidth={1}/></div></section>
    <section className="duckfun-promo wrap"><span className="duckfun-promo-icon"><Gamepad2 size={22}/></span><div><span className="section-kicker">DUCKFUN · ARCADE</span><h2>Une pause, un jeu ?</h2><p>Des mini-jeux originaux à découvrir dans DuckFun.</p></div><Link className="button" href="/duckfun">Explorer DuckFun <ArrowUpRight size={16}/></Link></section>
    <section className="section wrap" id="ecosysteme" data-visual-hidden={!settings.showServicesSection}><div className="section-head"><div><span className="section-kicker">{settings.servicesSectionLabel}</span><h2>{settings.servicesHeading}</h2></div><Link className="text-link" href="/services">Tous les services <ArrowUpRight size={16}/></Link></div><div className="branch-grid">{branches.map(({ icon: Icon, ...branch }, index) => <Link className="branch-card" key={branch.name} href={branch.href}><div className="branch-top"><span className={`branch-icon ${branch.color}`}><Icon size={19}/></span><span className="branch-number">0{index + 1}</span></div><h3>{branch.name}</h3><p>{branch.text}</p><span className="branch-arrow"><ArrowUpRight size={17}/></span></Link>)}</div></section>
    <section className="manifesto" data-visual-hidden={!settings.showManifestoSection}><div className="wrap manifesto-inner"><span className="section-kicker">{settings.manifestoLabel}</span><p>{settings.manifestoText}</p><Link href="/about" className="text-link">En savoir plus sur DUCK <ArrowRight size={16}/></Link><div className="manifesto-orb"/></div></section>
    <section className="closing-cta wrap" data-visual-hidden={!settings.showClosingSection}><div><span className="section-kicker">{settings.closingLabel}</span><h2>Une idée en tête ?<br/><span>Elle a sa place ici.</span></h2></div><Link href="/auth/signup" className="button">{settings.closingButtonLabel} <ArrowUpRight size={16}/></Link></section>
  </>;
}
