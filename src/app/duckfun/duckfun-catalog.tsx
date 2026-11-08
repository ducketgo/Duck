'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { DuckFunGame } from '@/lib/duckfun-games';
import styles from './duckfun.module.css';

const PAGE_SIZE = 24;

export function DuckFunCatalog({ games }: { games: DuckFunGame[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [page, setPage] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(() => ['Toutes', ...Array.from(new Set(games.map(game => game.category)))], [games]);
  const filtered = useMemo(() => games.filter(game =>
    (category === 'Toutes' || game.category === category)
    && `${game.title} ${game.description}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr'))
  ), [category, games, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === '/' && !target?.closest('input, textarea, select, [contenteditable="true"]')) { event.preventDefault(); searchRef.current?.focus(); }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return <>
    <div className={styles.catalogTools}>
      <label className={styles.searchBox}><Search size={17}/><input ref={searchRef} value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Rechercher un jeu…" aria-label="Rechercher un jeu"/><kbd>/</kbd></label>
      <label className={styles.categorySelect}><span>Catégorie</span><select value={category} onChange={event => { setCategory(event.target.value); setPage(0); }}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      <span className={styles.resultCount}>{filtered.length} jeux</span>
    </div>
    <div className={styles.gameGrid}>
      {visible.map((game, index) => <Link className={`${styles.gameCard} ${styles[game.color]}`} href={`/duckfun/${game.slug}`} key={game.slug}>
        <div className={styles.cardTop}><span className={styles.cardIndex}>{String(safePage * PAGE_SIZE + index + 1).padStart(3, '0')}</span><ArrowUpRight size={18}/></div>
        <div className={styles.cardArt} aria-hidden="true"><span>{game.mark}</span><b>DUCK<br/>FUN</b></div>
        <div className={styles.cardInfo}><span className={styles.category}>{game.category} · niveau {game.level}</span><h3>{game.title}</h3><p>{game.description}</p><span className={styles.playLink}>Jouer <ArrowUpRight size={15}/></span></div>
      </Link>)}
      {visible.length === 0 && <p className={styles.emptyResults}>Aucun jeu ne correspond à cette recherche.</p>}
    </div>
    <div className={styles.pagination}><button type="button" onClick={() => setPage(value => Math.max(0, value - 1))} disabled={safePage === 0}><ChevronLeft size={16}/> Précédent</button><span>Page {safePage + 1} sur {pageCount}</span><button type="button" onClick={() => setPage(value => Math.min(pageCount - 1, value + 1))} disabled={safePage + 1 >= pageCount}>Suivant <ChevronRight size={16}/></button></div>
  </>;
}
