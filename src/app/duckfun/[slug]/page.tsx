import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DUCKFUN_GAMES } from '@/lib/duckfun-games';
import { DuckFunPlayer } from '../duckfun-player';
import styles from '../duckfun.module.css';

export function generateStaticParams() {
  return DUCKFUN_GAMES.map(game => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = DUCKFUN_GAMES.find(item => item.slug === slug);
  return { title: game ? `${game.title} — DuckFun` : 'Jeu DuckFun', description: game?.description };
}

export default async function DuckFunGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = DUCKFUN_GAMES.find(item => item.slug === slug);
  if (!game) notFound();

  return <div className={`${styles.arcade} ${styles.gamePage}`}>
    <header className={styles.gameTopbar}><Link className={styles.backLink} href="/duckfun"><ArrowLeft size={16}/> DuckFun</Link><span className={styles.miniBrand}>DUCKPHONE / PLAY</span></header>
    <main className={styles.gameStage}><DuckFunPlayer game={game}/></main>
    <footer className={styles.gameFooter}><span>DUCKFUN · JEU ORIGINAL DUCKPHONE</span><Link href="/duckfun">Changer de jeu</Link></footer>
  </div>;
}
