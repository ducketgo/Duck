'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, TimerReset } from 'lucide-react';
import type { DuckFunGame } from '@/lib/duckfun-games';
import styles from './duckfun.module.css';

type Card = { id: number; symbol: string };
type StackBlock = { left: number; width: number };
const MEMORY_SYMBOLS = ['🦆', '📱', '🫧', '✨', '🌿', '🥚', '🛰️', '🔋', '🐸', '🌙', '🍀', '💎'];

function shuffledCards(symbols: string[]): Card[] {
  const cards = [...symbols, ...symbols].map((symbol, id) => ({ id, symbol }));
  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
  }
  return cards;
}

export function DuckFunPlayer({ game }: { game: DuckFunGame }) {
  if (game.slug === 'memoire-de-la-mare') return <MemoryGame game={game}/>;
  if (game.slug === 'plouf-reflexe') return <ReflexGame game={game}/>;
  return <DuckStackGame game={game}/>;
}

function GameHeading({ game, eyebrow }: { game: DuckFunGame; eyebrow: string }) {
  return <div className={styles.gameHeading}><span className={styles.gameEyebrow}>{eyebrow}</span><h1>{game.title}</h1><p>{game.description}</p></div>;
}

function MemoryGame({ game }: { game: DuckFunGame }) {
  const [pairCount, setPairCount] = useState(8);
  const [cards, setCards] = useState<Card[]>(() => [...MEMORY_SYMBOLS.slice(0, 8), ...MEMORY_SYMBOLS.slice(0, 8)].map((symbol, id) => ({ symbol, id })));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const complete = matched.length === pairCount;

  useEffect(() => {
    setCards(shuffledCards(MEMORY_SYMBOLS.slice(0, pairCount)));
    setBest(Number(window.localStorage.getItem(`duckfun-memory-${pairCount}`)) || null);
  }, [pairCount]);

  useEffect(() => {
    if (!started || complete) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, complete]);

  useEffect(() => {
    if (!complete || !moves || (best !== null && moves >= best)) return;
    setBest(moves);
    window.localStorage.setItem(`duckfun-memory-${pairCount}`, String(moves));
  }, [best, complete, moves, pairCount]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [first, second] = flipped.map(index => cards[index]);
    const delay = first.symbol === second.symbol ? 360 : 850;
    const timer = window.setTimeout(() => {
      if (first.symbol === second.symbol) setMatched(current => [...current, first.symbol]);
      setFlipped([]);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [cards, flipped]);

  function reset(count = pairCount) {
    setCards(shuffledCards(MEMORY_SYMBOLS.slice(0, count)));
    setFlipped([]); setMatched([]); setMoves(0); setSeconds(0); setStarted(false);
  }
  function changeDifficulty(count: number) { setPairCount(count); reset(count); }
  function reveal(card: Card) {
    if (flipped.length === 2 || matched.includes(card.symbol) || flipped.includes(card.id) || complete) return;
    setStarted(true);
    setFlipped(current => [...current, card.id]);
    if (flipped.length === 1) setMoves(value => value + 1);
  }

  return <section className={`${styles.experience} ${styles.memoryExperience}`}>
    <GameHeading game={game} eyebrow="JEU 01 · MÉMOIRE"/>
    <div className={styles.gameHud}><span><b>{moves}</b> essais</span><span><b>{matched.length}</b> / {pairCount} paires</span><span><b>{seconds}s</b></span><button type="button" onClick={() => reset()}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.memoryOptions} aria-label="Difficulté">
      <span>Difficulté</span><button type="button" aria-pressed={pairCount === 8} onClick={() => changeDifficulty(8)}>Classique · 8 paires</button><button type="button" aria-pressed={pairCount === 12} onClick={() => changeDifficulty(12)}>Expert · 12 paires</button>
      {best !== null && <span className={styles.record}>Record : {best} essais</span>}
    </div>
    <div className={styles.memoryGrid} style={{ gridTemplateColumns: pairCount === 12 ? 'repeat(6, minmax(0, 1fr))' : undefined }} aria-label="Cartes à retourner">
      {cards.map(card => {
        const faceUp = flipped.includes(card.id) || matched.includes(card.symbol);
        return <button aria-label={faceUp ? `Carte ${card.symbol}` : 'Retourner la carte'} aria-pressed={faceUp} className={`${styles.memoryCard} ${faceUp ? styles.memoryCardOpen : ''} ${matched.includes(card.symbol) ? styles.memoryCardMatched : ''}`} key={card.id} onClick={() => reveal(card)} type="button"><span>{faceUp ? card.symbol : 'D'}</span></button>;
      })}
    </div>
    <p className={styles.gameMessage} role="status">{complete ? `Bravo ! ${moves} essais en ${seconds} secondes${best === moves ? ' · nouveau record !' : ''}` : 'Retourne deux cartes et retrouve les symboles identiques.'}</p>
  </section>;
}

function ReflexGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(0);
  useEffect(() => { setBest(Number(window.localStorage.getItem('duckfun-reflex-best')) || 0); }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTimeLeft(value => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    const shuffle = window.setInterval(() => setTarget(value => {
      let next = Math.floor(Math.random() * 9);
      if (next === value) next = (value + 4) % 9;
      return next;
    }), Math.max(390, 820 - score * 12));
    return () => window.clearInterval(shuffle);
  }, [playing, score]);
  useEffect(() => {
    if (!playing || timeLeft > 0) return;
    setPlaying(false);
    if (score > best) { setBest(score); window.localStorage.setItem('duckfun-reflex-best', String(score)); }
  }, [best, playing, score, timeLeft]);

  function start() { setScore(0); setMisses(0); setCombo(0); setTimeLeft(20); setTarget(4); setPlaying(true); }
  function tap(index: number) {
    if (!playing) return;
    if (index === target) {
      setCombo(value => value + 1);
      setScore(value => value + 1 + (combo >= 3 ? 1 : 0));
      setTarget((index + 3 + Math.floor(Math.random() * 5)) % 9);
    } else { setMisses(value => value + 1); setCombo(0); }
  }

  return <section className={`${styles.experience} ${styles.reflexExperience}`}>
    <GameHeading game={game} eyebrow="JEU 02 · RÉFLEXES"/>
    <div className={styles.reflexStats}><span><TimerReset size={17}/><b>{Math.max(timeLeft, 0)} s</b></span><span><Sparkles size={17}/><b>{score}</b> points</span><span><b>{combo}×</b> série</span><span><b>{misses}</b> ratés</span></div>
    <div className={styles.reflexGrid} aria-label="Plateau de jeu">
      {Array.from({ length: 9 }, (_, index) => <button className={`${styles.reflexCell} ${playing && index === target ? styles.reflexTarget : ''}`} key={index} onClick={() => tap(index)} type="button" aria-label={playing && index === target ? 'Canard, tape !' : 'Case vide'}>{playing && index === target ? <span>🦆</span> : <i/>}</button>)}
      {!playing && <div className={styles.reflexOverlay}><strong>{timeLeft === 0 ? `Score : ${score}` : 'Prêt à plonger ?'}</strong>{timeLeft === 0 && <span>Record personnel : {best} points</span>}<button className={styles.playButton} type="button" onClick={start}>{timeLeft === 0 ? 'Rejouer' : 'Démarrer'}</button></div>}
    </div>
    <p className={styles.gameMessage} role="status">Tape le canard, enchaîne les séries pour doubler tes points. Record : {best}.</p>
  </section>;
}

function DuckStackGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false);
  const [width, setWidth] = useState(64);
  const [left, setLeft] = useState(18);
  const [moving, setMoving] = useState(0);
  const [blocks, setBlocks] = useState<StackBlock[]>([]);
  const [best, setBest] = useState(0);
  const directionRef = useRef(1);
  const dropAction = useRef<() => void>(() => undefined);
  useEffect(() => { setBest(Number(window.localStorage.getItem('duckfun-stack-best')) || 0); }, []);

  useEffect(() => {
    if (!playing) return;
    const speed = Math.min(1.3 + blocks.length * 0.1, 3.2);
    const ticker = window.setInterval(() => {
      setMoving(current => {
        let next = current + directionRef.current * speed;
        if (next >= 100 - width) { next = 100 - width; directionRef.current = -1; }
        if (next <= 0) { next = 0; directionRef.current = 1; }
        return next;
      });
    }, 24);
    return () => window.clearInterval(ticker);
  }, [blocks.length, playing, width]);

  function reset() {
    directionRef.current = 1; setWidth(64); setLeft(18); setMoving(0); setBlocks([]); setPlaying(true);
  }
  function drop() {
    if (!playing) return;
    const overlapLeft = Math.max(left, moving);
    const overlapRight = Math.min(left + width, moving + width);
    const nextWidth = overlapRight - overlapLeft;
    if (nextWidth < 7) {
      setPlaying(false);
      if (blocks.length > best) { setBest(blocks.length); window.localStorage.setItem('duckfun-stack-best', String(blocks.length)); }
      return;
    }
    setBlocks(current => [...current, { left: overlapLeft, width: nextWidth }]);
    if (blocks.length + 1 > best) { setBest(blocks.length + 1); window.localStorage.setItem('duckfun-stack-best', String(blocks.length + 1)); }
    setLeft(overlapLeft); setWidth(nextWidth); setMoving(0); directionRef.current = 1;
  }
  dropAction.current = drop;

  useEffect(() => {
    if (!playing) return;
    function handleSpace(event: KeyboardEvent) {
      if (event.code === 'Space') { event.preventDefault(); dropAction.current(); }
    }
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [playing]);

  return <section className={`${styles.experience} ${styles.stackExperience}`}>
    <GameHeading game={game} eyebrow="JEU 03 · ADRESSE"/>
    <div className={styles.gameHud}><span><b>{blocks.length}</b> étages</span><span>Record : <b>{best}</b></span><button type="button" onClick={reset}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.stackBoard}>
      <div className={styles.stackSky}><span>DUCKPHONE</span><span>ÉTAGE {String(blocks.length + 1).padStart(2, '0')}</span></div>
      {blocks.slice(-8).map((block, index) => <div className={styles.stackBlock} key={index} style={{ width: `${block.width}%`, left: `${block.left}%`, bottom: `${34 + index * 19}px` }}/>) }
      {playing && <div className={`${styles.stackBlock} ${styles.stackMoving}`} style={{ width: `${width}%`, left: `${moving}%`, bottom: 34 + blocks.slice(-8).length * 19 }}/>}
      {!playing && <div className={styles.stackOverlay}><strong>{blocks.length ? `Tour : ${blocks.length} étages` : 'Prêt à empiler ?'}</strong>{blocks.length > 0 && blocks.length >= best && <span>Nouveau record !</span>}<button className={styles.playButton} type="button" onClick={blocks.length ? reset : () => { setPlaying(true); directionRef.current = 1; }}>{blocks.length ? 'Rejouer' : 'Commencer'}</button></div>}
      <div className={styles.stackBase} style={{ left: '18%', width: '64%' }}/>
    </div>
    {playing && <button className={styles.dropButton} type="button" onClick={drop}>Poser le bloc <span>ESPACE</span></button>}
    <p className={styles.gameMessage} role="status">Clique ou appuie sur Espace quand le bloc passe au-dessus de la tour. Record : {best} étages.</p>
  </section>;
}
