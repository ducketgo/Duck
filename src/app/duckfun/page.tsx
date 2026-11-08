import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Gamepad2, Sparkles } from 'lucide-react';
import { DUCKFUN_GAMES } from '@/lib/duckfun-games';
import styles from './duckfun.module.css';

export const metadata: Metadata = {
  title: 'DuckFun — les jeux DuckPhone',
  description: 'Des mini-jeux indépendants imaginés pour DuckPhone.',
};

export default function DuckFunPage() {
  return <div className={styles.arcade}>
    <header className={styles.topbar}>
      <Link className={styles.backLink} href="/"><ArrowLeft size={16}/> DUCKPHONE</Link>
      <span className={styles.status}><i/> ARCADE EN LIGNE</span>
    </header>
    <main className={styles.catalog}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}><Sparkles size={14}/> UN PETIT DÉTOUR DANS L’UNIVERS DUCKPHONE</span>
        <div className={styles.titleRow}><span className={styles.logo}><Gamepad2 size={31}/></span><h1>Duck<span>Fun</span></h1></div>
        <p>Des jeux courts, des idées curieuses et des défis créés pour DuckPhone.</p>
        <div className={styles.heroMeta}><span>{DUCKFUN_GAMES.length} jeux disponibles</span><span>·</span><span>Gratuits et jouables au clavier ou au toucher</span></div>
      </section>
      <section className={styles.gameSection} aria-labelledby="games-heading">
        <div className={styles.sectionHeading}><div><span>CHOISIS TON DÉFI</span><h2 id="games-heading">À toi de jouer.</h2></div><span className={styles.sectionCount}>01 — 0{DUCKFUN_GAMES.length}</span></div>
        <div className={styles.gameGrid}>
          {DUCKFUN_GAMES.map((game, index) => <Link className={`${styles.gameCard} ${styles[game.color]}`} href={`/duckfun/${game.slug}`} key={game.slug}>
            <div className={styles.cardTop}><span className={styles.cardIndex}>0{index + 1}</span><ArrowUpRight size={18}/></div>
            <div className={styles.cardArt} aria-hidden="true"><span>{game.mark}</span><b>DUCK<br/>FUN</b></div>
            <div className={styles.cardInfo}><span className={styles.category}>{game.category}</span><h3>{game.title}</h3><p>{game.description}</p><span className={styles.playLink}>Jouer maintenant <ArrowUpRight size={15}/></span></div>
          </Link>)}
        </div>
      </section>
      <footer className={styles.footer}><span>DUCKFUN · UNE CRÉATION DUCKPHONE</span><Link href="/">Retourner sur DUCK <ArrowUpRight size={14}/></Link></footer>
    </main>
  </div>;
}
