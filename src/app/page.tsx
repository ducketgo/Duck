import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Box, Code2, Compass, Globe2, ShieldCheck, Users } from 'lucide-react';

const branches = [
  { icon: Code2, name: 'DuckDev', text: 'Construire et faire grandir les outils de l’écosystème.', color: 'cyan', href: '/services/duckdev' },
  { icon: AudioLines, name: 'DjDuck', text: 'Un espace pour la musique, les idées et la création.', color: 'violet', href: '/services/djduck' },
  { icon: Box, name: 'DuckOS', text: 'Explorer une vision accessible du système d’exploitation.', color: 'green', href: '/services/duckos' },
  { icon: Globe2, name: 'DuckWeb', text: 'Des services web utiles, ouverts et reliés entre eux.', color: 'cyan', href: '/services/duckweb' },
  { icon: Users, name: 'DuckCommunity', text: 'Apprendre, échanger et créer avec la communauté.', color: 'violet', href: '/services/duckcommunity' },
  { icon: ShieldCheck, name: 'DuckAuth', text: 'Une identité commune, avec la confidentialité en priorité.', color: 'green', href: '/services/duckauth' },
];

export default function HomePage() {
  return <>
    <section className="hero wrap">
      <div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> UN ÉCOSYSTÈME EN CONSTRUCTION</div><h1>Le numérique<br/>se construit <span>ensemble.</span></h1><p className="hero-lede">DUCK rassemble des logiciels, des projets et une communauté pour apprendre, créer et avancer à son rythme.</p><div className="hero-actions"><Link className="button" href="/services">Explorer DUCK <ArrowRight size={17}/></Link><Link className="text-link" href="/about">Découvrir notre histoire <ArrowUpRight size={16}/></Link></div><div className="hero-note"><span className="note-line"/> Une initiative ouverte portée par sa communauté</div></div>
      <div className="hero-art" aria-label="Illustration abstraite de l’univers DUCK"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="hero-core"><div className="duck-symbol">D</div><span>DUCK<br/><small>COMMUNITY SYSTEM</small></span></div><span className="orbit-node node-a"><Code2 size={18}/></span><span className="orbit-node node-b"><AudioLines size={18}/></span><span className="orbit-node node-c"><Users size={18}/></span><span className="orbit-node node-d"><Globe2 size={18}/></span><span className="art-caption">UN UNIVERS. PLUSIEURS POSSIBILITÉS.</span></div>
      <Link className="scroll-cue" href="#ecosysteme" aria-label="Découvrir l’écosystème"><ArrowDownRight size={17}/></Link>
    </section>
    <section className="intro-band"><div className="wrap intro-inner"><span className="section-kicker">NOTRE INTENTION</span><p>Un endroit accueillant pour <em>se retrouver, échanger, créer et apprendre.</em></p><Compass className="intro-icon" strokeWidth={1}/></div></section>
    <section className="section wrap" id="ecosysteme"><div className="section-head"><div><span className="section-kicker">UN ÉCOSYSTÈME QUI GRANDIT</span><h2>Des espaces pour <span>chaque idée.</span></h2></div><Link className="text-link" href="/services">Tous les services <ArrowUpRight size={16}/></Link></div><div className="branch-grid">{branches.map(({ icon: Icon, ...b }, i) => <Link className="branch-card" key={b.name} href={b.href}><div className="branch-top"><span className={`branch-icon ${b.color}`}><Icon size={19}/></span><span className="branch-number">0{i + 1}</span></div><h3>{b.name}</h3><p>{b.text}</p><span className="branch-arrow"><ArrowUpRight size={17}/></span></Link>)}</div></section>
    <section className="manifesto"><div className="wrap manifesto-inner"><span className="section-kicker">LA DEVISE DUCK</span><p>Apprendre, avancer<br/>et <span>performer.</span></p><Link href="/about" className="text-link">En savoir plus sur DUCK <ArrowRight size={16}/></Link><div className="manifesto-orb"/></div></section>
    <section className="closing-cta wrap"><div><span className="section-kicker">LA SUITE S’ÉCRIT ENSEMBLE</span><h2>Une idée en tête ?<br/><span>Elle a sa place ici.</span></h2></div><Link href="/auth/signup" className="button">Rejoindre la communauté <ArrowUpRight size={16}/></Link></section>
  </>;
}
