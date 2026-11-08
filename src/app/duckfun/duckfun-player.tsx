'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, TimerReset } from 'lucide-react';
import type { DuckFunGame } from '@/lib/duckfun-games';
import styles from './duckfun.module.css';

type Card = { id: number; symbol: string };
type StackBlock = { left: number; width: number };

function shuffledCards(): Card[] {
  const symbols = ['🦆', '📱', '🫧', '✨', '🌿', '🥚', '🛰️', '🔋'];
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
  const [cards, setCards] = useState<Card[]>(() => ['🦆', '📱', '🫧', '✨', '🌿', '🥚', '🛰️', '🔋', '🦆', '📱', '🫧', '✨', '🌿', '🥚', '🛰️', '🔋'].map((symbol, id) => ({ symbol, id })));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => { setCards(shuffledCards()); }, []);

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

  function reset() { setCards(shuffledCards()); setFlipped([]); setMatched([]); setMoves(0); }
  function reveal(card: Card) {
    if (flipped.length === 2 || matched.includes(card.symbol) || flipped.includes(card.id)) return;
    setFlipped(current => [...current, card.id]);
    if (flipped.length === 1) setMoves(value => value + 1);
  }

  const complete = matched.length === 8;
  return <section className={`${styles.experience} ${styles.memoryExperience}`}>
    <GameHeading game={game} eyebrow="JEU 01 · MÉMOIRE"/>
    <div className={styles.gameHud}><span><b>{moves}</b> essais</span><span><b>{matched.length}</b> / 8 paires</span><button type="button" onClick={reset}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.memoryGrid} aria-label="Cartes à retourner">
      {cards.map(card => {
        const faceUp = flipped.includes(card.id) || matched.includes(card.symbol);
        return <button aria-label={faceUp ? `Carte ${card.symbol}` : 'Retourner la carte'} aria-pressed={faceUp} className={`${styles.memoryCard} ${faceUp ? styles.memoryCardOpen : ''}`} key={card.id} onClick={() => reveal(card)} type="button"><span>{faceUp ? card.symbol : 'D'}</span></button>;
      })}
    </div>
    <p className={styles.gameMessage} role="status">{complete ? 'Toutes les paires sont retrouvées. Belle mémoire !' : 'Retourne deux cartes et retrouve les symboles identiques.'}</p>
  </section>;
}

function ReflexGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTimeLeft(value => value - 1), 1000);
    const shuffle = window.setInterval(() => setTarget(value => {
      let next = Math.floor(Math.random() * 9);
      if (next === value) next = (next + 4) % 9;
      return next;
    }), 820);
    return () => { window.clearInterval(timer); window.clearInterval(shuffle); };
  }, [playing]);

  useEffect(() => { if (playing && timeLeft <= 0) setPlaying(false); }, [playing, timeLeft]);

  function start() { setScore(0); setTimeLeft(20); setTarget(4); setPlaying(true); }
  function tap(index: number) { if (playing && index === target) { setScore(value => value + 1); setTarget((index + 3 + Math.floor(Math.random() * 5)) % 9); } }

  return <section className={`${styles.experience} ${styles.reflexExperience}`}>
    <GameHeading game={game} eyebrow="JEU 02 · RÉFLEXES"/>
    <div className={styles.reflexStats}><span><TimerReset size={17}/><b>{Math.max(timeLeft, 0)} s</b></span><span><Sparkles size={17}/><b>{score}</b> touches</span></div>
    <div className={styles.reflexGrid} aria-label="Plateau de jeu">
      {Array.from({ length: 9 }, (_, index) => <button className={`${styles.reflexCell} ${playing && index === target ? styles.reflexTarget : ''}`} key={index} onClick={() => tap(index)} type="button" aria-label={playing && index === target ? 'Canard, tape !' : 'Case vide'}>{playing && index === target ? <span>🦆</span> : <i/>}</button>)}
      {!playing && <div className={styles.reflexOverlay}><strong>{timeLeft === 0 ? `Score : ${score}` : 'Prêt à plonger ?'}</strong><button className={styles.playButton} type="button" onClick={start}>{timeLeft === 0 ? 'Rejouer' : 'Démarrer'}</button></div>}
    </div>
    <p className={styles.gameMessage} role="status">Tape le canard dès qu’il apparaît. Tu as vingt secondes.</p>
  </section>;
}

function DuckStackGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false);
  const [width, setWidth] = useState(64);
  const [left, setLeft] = useState(18);
  const [moving, setMoving] = useState(0);
  const [blocks, setBlocks] = useState<StackBlock[]>([]);
  const directionRef = useRef(1);
  const dropAction = useRef<() => void>(() => undefined);

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
    if (nextWidth < 7) { setPlaying(false); return; }
    setBlocks(current => [...current, { left: overlapLeft, width: nextWidth }]);
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
    <div className={styles.gameHud}><span><b>{blocks.length}</b> étages</span><button type="button" onClick={reset}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.stackBoard}>
      <div className={styles.stackSky}><span>DUCKPHONE</span><span>ÉTAGE {String(blocks.length + 1).padStart(2, '0')}</span></div>
      {blocks.slice(-8).map((block, index) => <div className={styles.stackBlock} key={index} style={{ width: `${block.width}%`, left: `${block.left}%`, bottom: `${34 + index * 19}px` }}/>) }
      {playing && <div className={`${styles.stackBlock} ${styles.stackMoving}`} style={{ width: `${width}%`, left: `${moving}%`, bottom: 34 + blocks.slice(-8).length * 19 }}/>}
      {!playing && <div className={styles.stackOverlay}><strong>{blocks.length ? `Tour : ${blocks.length} étages` : 'Prêt à empiler ?'}</strong><button className={styles.playButton} type="button" onClick={blocks.length ? reset : () => { setPlaying(true); directionRef.current = 1; }}> {blocks.length ? 'Rejouer' : 'Commencer'}</button></div>}
      <div className={styles.stackBase} style={{ left: '18%', width: '64%' }}/>
    </div>
    {playing && <button className={styles.dropButton} type="button" onClick={drop}>Poser le bloc <span>ESPACE</span></button>}
    <p className={styles.gameMessage} role="status">Clique ou appuie sur Espace quand le bloc passe au-dessus de la tour.</p>
  </section>;
}
