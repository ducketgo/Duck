import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Gamepad2, Sparkles } from 'lucide-react';
import { DUCKFUN_GAMES } from '@/lib/duckfun-games';
import { DuckFunCatalog } from './duckfun-catalog';
import styles from './duckfun.module.css';

export const metadata: Metadata = {
  title: 'DuckFun — 200 jeux',
  description: 'Deux cents mini-jeux de mémoire, de réflexion, de vitesse et d’adresse.',
};

export default function DuckFunPage() {
  return <div className={styles.arcade}>
    <header className={styles.topbar}>
      <Link className={styles.backLink} href="/"><ArrowLeft size={16}/> ACCUEIL</Link>
      <span className={styles.status}><i/> ARCADE EN LIGNE</span>
    </header>
    <main className={styles.catalog}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}><Sparkles size={14}/> DES JEUX POUR FAIRE UNE PAUSE</span>
        <div className={styles.titleRow}><span className={styles.logo}><Gamepad2 size={31}/></span><h1>Duck<span>Fun</span></h1></div>
        <p>Deux cents défis courts à découvrir. Choisis ta catégorie, trouve ton jeu et lance une partie.</p>
        <div className={styles.heroMeta}><span>{DUCKFUN_GAMES.length} jeux disponibles</span><span>·</span><span>Gratuits et jouables au clavier ou au toucher</span></div>
      </section>
      <section className={styles.gameSection} aria-labelledby="games-heading">
        <div className={styles.sectionHeading}><div><span>CHOISIS TON DÉFI</span><h2 id="games-heading">À toi de jouer.</h2></div><span className={styles.sectionCount}>{String(DUCKFUN_GAMES.length).padStart(3, '0')} JEUX</span></div>
        <DuckFunCatalog games={DUCKFUN_GAMES}/>
      </section>
      <footer className={styles.footer}><span>DUCKFUN · 200 JEUX JOUABLES</span><Link href="/">Retour à l’accueil <ArrowUpRight size={14}/></Link></footer>
    </main>
  </div>;
}
