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
  const key = game.slug;
  if (game.engine === 'memory') return <MemoryGame game={game} key={key}/>;
  if (game.engine === 'reflex') return <ReflexGame game={game} key={key}/>;
  if (game.engine === 'stack') return <DuckStackGame game={game} key={key}/>;
  if (game.engine === 'number') return <NumberGame game={game} key={key}/>;
  if (game.engine === 'math') return <MathGame game={game} key={key}/>;
  if (game.engine === 'color') return <ColorGame game={game} key={key}/>;
  if (game.engine === 'path') return <NumberPathGame game={game} key={key}/>;
  return <DuckSequenceGame game={game} key={key}/>;
}

function GameHeading({ game, eyebrow }: { game: DuckFunGame; eyebrow: string }) {
  return <div className={styles.gameHeading}><span className={styles.gameEyebrow}>{eyebrow}</span><h1>{game.title}</h1><p>{game.description}</p></div>;
}

function NumberGame({ game }: { game: DuckFunGame }) {
  const [target, setTarget] = useState(42);
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState<number[]>([]);
  const [message, setMessage] = useState(`Choisis un nombre entre 1 et ${Math.min(1500, 100 + game.level * 50)}.`);
  const [won, setWon] = useState(false);
  const range = Math.min(1500, 100 + game.level * 50);
  const maxAttempts = Math.max(4, 10 - Math.floor(game.level / 4));
  useEffect(() => { setTarget(1 + Math.floor(Math.random() * range)); }, [range]);
  function guess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > range || won || attempts.length >= maxAttempts) return;
    const next = [...attempts, number]; setAttempts(next); setValue('');
    if (number === target) { setMessage('Trouvé ! Le canard était bien caché.'); setWon(true); }
    else if (next.length === maxAttempts) setMessage(`La mare révèle le nombre : ${target}.`);
    else setMessage(number < target ? 'Plus haut !' : 'Plus bas !');
  }
  function restart() { setTarget(1 + Math.floor(Math.random() * range)); setAttempts([]); setValue(''); setMessage(`Choisis un nombre entre 1 et ${range}.`); setWon(false); }
  return <section className={styles.experience}><GameHeading game={game} eyebrow="DÉDUCTION"/><div className={styles.numberSecret}>🫧<strong>?</strong></div><div className={styles.numberMessage} role="status">{message}</div><p className={styles.gameMessage}>Essai {Math.min(attempts.length + 1, maxAttempts)} sur {maxAttempts} · plage 1 à {range}</p><form className={styles.guessForm} onSubmit={guess}><input aria-label="Ton nombre" type="number" min="1" max={range} value={value} onChange={event => setValue(event.target.value)} placeholder={`1 à ${range}`} disabled={won || attempts.length >= maxAttempts}/><button className={styles.playButton} type="submit" disabled={won || attempts.length >= maxAttempts}>Deviner</button></form><div className={styles.guessHistory}>{attempts.map((attempt, index) => <span key={`${attempt}-${index}`}>{attempt}</span>)}</div>{(won || attempts.length >= maxAttempts) && <button className={styles.inlineRestart} type="button" onClick={restart}>Nouvelle partie</button>}</section>;
}

type MathQuestion = { prompt: string; answer: number; choices: number[] };
function makeMathQuestion(level = 1): MathQuestion {
  let a = 2 + Math.floor(Math.random() * Math.min(80, 18 + level * 2));
  let b = 2 + Math.floor(Math.random() * Math.min(30, 12 + level));
  const operation = level >= 8 ? Math.floor(Math.random() * 3) : Math.random() > .55 ? 1 : 0;
  if (operation === 2 && b > a) [a, b] = [b, a];
  const answer = operation === 1 ? a * b : operation === 2 ? Math.abs(a - b) : a + b;
  const choices = new Set([answer]);
  const spread = Math.max(8, Math.floor(answer * .15));
  while (choices.size < 4) choices.add(Math.max(0, answer + Math.floor(Math.random() * (spread * 2 + 1)) - spread));
  return { prompt: `${a} ${operation === 1 ? '×' : operation === 2 ? '−' : '+'} ${b}`, answer, choices: [...choices].sort(() => Math.random() - .5) };
}
function MathGame({ game }: { game: DuckFunGame }) {
  const [question, setQuestion] = useState<MathQuestion>({ prompt: '7 + 5', answer: 12, choices: [12, 10, 14, 9] });
  const [playing, setPlaying] = useState(false); const [seconds, setSeconds] = useState(30); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [best, setBest] = useState(0);
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-math-${game.slug}`)) || 0); }, [game.slug]);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setSeconds(value => value - 1), 1000); return () => window.clearInterval(timer); }, [playing]);
  useEffect(() => { if (!playing || seconds > 0) return; setPlaying(false); if (score > best) { setBest(score); window.localStorage.setItem(`duckfun-math-${game.slug}`, String(score)); } }, [best, game.slug, playing, score, seconds]);
  function answer(value: number) { if (!playing) return; if (value === question.answer) { setScore(current => current + 1 + (streak >= 4 ? 1 : 0)); setStreak(current => current + 1); } else setStreak(0); setQuestion(makeMathQuestion(game.level)); }
  function start() { setScore(0); setStreak(0); setSeconds(Math.max(15, 50 - game.level)); setQuestion(makeMathQuestion(game.level)); setPlaying(true); }
  return <section className={styles.experience}><GameHeading game={game} eyebrow="CALCUL MENTAL"/><div className={styles.reflexStats}><span><TimerReset size={17}/><b>{seconds}s</b></span><span><Sparkles size={17}/><b>{score}</b> points</span><span><b>{streak}</b> série</span></div><div className={styles.mathQuestion} aria-live="polite">{question.prompt} = ?</div><div className={styles.answerGrid}>{question.choices.map(choice => <button type="button" key={choice} onClick={() => answer(choice)} disabled={!playing}>{choice}</button>)}</div>{!playing && <div className={styles.inlineStart}><span>{seconds === 0 ? `Score : ${score} · record : ${best}` : `${Math.max(15, 50 - game.level)} secondes, prêt ?`}</span><button className={styles.playButton} type="button" onClick={start}>{seconds === 0 ? 'Rejouer' : 'Démarrer'}</button></div>}<p className={styles.gameMessage}>Les bonnes réponses en série rapportent un point bonus.</p></section>;
}

const PALETTE = [{ name: 'Turquoise', color: '#72e2d4' }, { name: 'Corail', color: '#ff8f86' }, { name: 'Violet', color: '#b09bff' }, { name: 'Citron', color: '#d8e875' }];
function ColorGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false); const [seconds, setSeconds] = useState(25); const [score, setScore] = useState(0); const [combo, setCombo] = useState(0); const [target, setTarget] = useState(0); const [best, setBest] = useState(0);
  const colorCount = Math.min(4, 2 + Math.floor(game.level / 6)); const roundSeconds = Math.max(12, 25 - Math.floor((game.level - 1) / 2));
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-color-${game.slug}`)) || 0); }, [game.slug]);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setSeconds(value => value - 1), 1000); return () => window.clearInterval(timer); }, [playing]);
  useEffect(() => { if (!playing || seconds > 0) return; setPlaying(false); if (score > best) { setBest(score); window.localStorage.setItem(`duckfun-color-${game.slug}`, String(score)); } }, [best, game.slug, playing, score, seconds]);
  function choose(index: number) { if (!playing) return; if (index === target) { setCombo(value => value + 1); setScore(value => value + 1 + (combo >= 4 ? 1 : 0)); } else setCombo(0); setTarget(value => (value + 1 + Math.floor(Math.random() * (colorCount - 1))) % colorCount); }
  function start() { setSeconds(roundSeconds); setScore(0); setCombo(0); setTarget(Math.floor(Math.random() * colorCount)); setPlaying(true); }
  return <section className={styles.experience}><GameHeading game={game} eyebrow="COULEURS"/><div className={styles.reflexStats}><span><TimerReset size={17}/><b>{seconds}s</b></span><span><Sparkles size={17}/><b>{score}</b> points</span><span><b>{combo}</b> série</span></div><p className={styles.colorPrompt}>Touche la couleur <strong style={{ color: PALETTE[target].color }}>{PALETTE[target].name}</strong></p><div className={styles.colorGrid}>{PALETTE.slice(0, colorCount).map((color, index) => <button type="button" key={color.name} disabled={!playing} aria-label={color.name} style={{ '--swatch': color.color } as React.CSSProperties} onClick={() => choose(index)}><i/></button>)}</div>{!playing && <div className={styles.inlineStart}><span>{seconds === 0 ? `Score : ${score} · record : ${best}` : `${roundSeconds} secondes, prêt ?`}</span><button className={styles.playButton} type="button" onClick={start}>{seconds === 0 ? 'Rejouer' : 'Démarrer'}</button></div>}<p className={styles.gameMessage}>Garde le rythme et enchaîne les bonnes réponses pour marquer plus.</p></section>;
}

function NumberPathGame({ game }: { game: DuckFunGame }) {
  const size = Math.min(6, 3 + Math.floor((game.level - 1) / 6)); const total = size * size;
  const [numbers, setNumbers] = useState<number[]>(Array.from({ length: total }, (_, index) => index + 1)); const [next, setNext] = useState(1); const [startedAt, setStartedAt] = useState<number | null>(null); const [elapsed, setElapsed] = useState(0); const [best, setBest] = useState<number | null>(null); const finished = next === total + 1;
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-path-${game.slug}`)) || null); }, [game.slug]);
  useEffect(() => { if (startedAt === null || finished) return; const timer = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 50); return () => window.clearInterval(timer); }, [finished, startedAt]);
  useEffect(() => { if (!finished || startedAt === null) return; const result = (Date.now() - startedAt) / 1000; setElapsed(result); if (best === null || result < best) { setBest(result); window.localStorage.setItem(`duckfun-path-${game.slug}`, String(result)); } }, [best, finished, game.slug, startedAt]);
  function start() { setNumbers([...Array.from({ length: total }, (_, index) => index + 1)].sort(() => Math.random() - .5)); setNext(1); setElapsed(0); setStartedAt(Date.now()); }
  function tap(number: number) { if (startedAt === null || finished) return; if (number === next) setNext(value => value + 1); }
  return <section className={styles.experience}><GameHeading game={game} eyebrow="VITESSE"/><div className={styles.reflexStats}><span><TimerReset size={17}/><b>{elapsed.toFixed(1)} s</b></span><span><b>{Math.min(next - 1, total)}</b> / {total}</span><span>Record : <b>{best ? `${best.toFixed(1)} s` : '—'}</b></span></div><div className={styles.pathGrid} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>{numbers.map(number => <button type="button" key={number} disabled={startedAt === null || finished || number < next} className={number < next ? styles.pathFound : ''} onClick={() => tap(number)}>{number}</button>)}</div>{(startedAt === null || finished) && <div className={styles.inlineStart}><span>{finished ? `Terminé en ${elapsed.toFixed(1)} secondes !` : 'Touchez les nombres dans l’ordre.'}</span><button className={styles.playButton} type="button" onClick={start}>{finished ? 'Rejouer' : 'Commencer'}</button></div>}<p className={styles.gameMessage}>Un faux pas ? Pas de pénalité, retrouve simplement le prochain nombre.</p></section>;
}

function DuckSequenceGame({ game }: { game: DuckFunGame }) {
  const [sequence, setSequence] = useState<number[]>([]); const [input, setInput] = useState<number[]>([]); const [active, setActive] = useState<number | null>(null); const [showing, setShowing] = useState(false); const [best, setBest] = useState(0); const [message, setMessage] = useState('Observe les cases, puis reproduis la séquence.');
  const cellCount = game.level >= 10 ? 16 : 9; const playbackStep = Math.max(360, 680 - game.level * 8);
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-sequence-${game.slug}`)) || 0); }, [game.slug]);
  useEffect(() => { if (!showing) return; const timers: number[] = []; sequence.forEach((value, index) => { timers.push(window.setTimeout(() => setActive(value), 420 + index * playbackStep)); timers.push(window.setTimeout(() => setActive(null), 820 + index * playbackStep)); }); timers.push(window.setTimeout(() => { setShowing(false); setInput([]); setMessage('À toi de jouer !'); }, 420 + sequence.length * playbackStep)); return () => timers.forEach(window.clearTimeout); }, [playbackStep, sequence, showing]);
  function start() { const first = [Math.floor(Math.random() * cellCount)]; setSequence(first); setInput([]); setMessage('Mémorise la séquence…'); setShowing(true); }
  function press(index: number) {
    if (showing || !sequence.length) return;
    const attempt = [...input, index]; setInput(attempt);
    if (sequence[attempt.length - 1] !== index) { setMessage(`Fin de partie · ${sequence.length - 1} étapes réussies.`); if (sequence.length - 1 > best) { setBest(sequence.length - 1); window.localStorage.setItem(`duckfun-sequence-${game.slug}`, String(sequence.length - 1)); } setSequence([]); setInput([]); return; }
    if (attempt.length === sequence.length) { const next = [...sequence, Math.floor(Math.random() * cellCount)]; setSequence(next); setShowing(true); setMessage('Bien joué ! Retient la nouvelle séquence.'); }
  }
  return <section className={styles.experience}><GameHeading game={game} eyebrow="MÉMOIRE"/><div className={styles.reflexStats}><span><Sparkles size={17}/><b>{Math.max(0, sequence.length - (showing ? 1 : 0))}</b> étapes</span><span>Record : <b>{best}</b></span></div><div className={styles.sequenceGrid} style={{ gridTemplateColumns: cellCount === 16 ? 'repeat(4, minmax(0, 1fr))' : undefined }}>{Array.from({ length: cellCount }, (_, index) => <button key={index} type="button" disabled={showing || !sequence.length} className={active === index ? styles.sequenceLit : ''} onClick={() => press(index)} aria-label={`Case ${index + 1}`}/>)}</div><div className={styles.inlineStart}><span role="status">{message}</span>{!sequence.length && <button className={styles.playButton} type="button" onClick={start}>Commencer</button>}</div></section>;
}

function MemoryGame({ game }: { game: DuckFunGame }) {
  const [pairCount, setPairCount] = useState(Math.min(12, 8 + Math.floor((game.level - 1) / 5)));
  const [cards, setCards] = useState<Card[]>(() => [...MEMORY_SYMBOLS.slice(0, Math.min(12, 8 + Math.floor((game.level - 1) / 5))), ...MEMORY_SYMBOLS.slice(0, Math.min(12, 8 + Math.floor((game.level - 1) / 5)))].map((symbol, id) => ({ symbol, id })));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const complete = matched.length === pairCount;

  useEffect(() => {
    setCards(shuffledCards(MEMORY_SYMBOLS.slice(0, pairCount)));
    setBest(Number(window.localStorage.getItem(`duckfun-memory-${game.slug}-${pairCount}`)) || null);
  }, [game.slug, pairCount]);

  useEffect(() => {
    if (!started || complete) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, complete]);

  useEffect(() => {
    if (!complete || !moves || (best !== null && moves >= best)) return;
    setBest(moves);
    window.localStorage.setItem(`duckfun-memory-${game.slug}-${pairCount}`, String(moves));
  }, [best, complete, game.slug, moves, pairCount]);

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
  function reveal(card: Card, index: number) {
    if (flipped.length === 2 || matched.includes(card.symbol) || flipped.includes(index) || complete) return;
    setStarted(true);
    setFlipped(current => [...current, index]);
    if (flipped.length === 1) setMoves(value => value + 1);
  }

  return <section className={`${styles.experience} ${styles.memoryExperience}`}>
    <GameHeading game={game} eyebrow="MÉMOIRE"/>
    <div className={styles.gameHud}><span><b>{moves}</b> essais</span><span><b>{matched.length}</b> / {pairCount} paires</span><span><b>{seconds}s</b></span><button type="button" onClick={() => reset()}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.memoryOptions} aria-label="Difficulté">
      <span>Difficulté</span><button type="button" aria-pressed={pairCount === 8} onClick={() => changeDifficulty(8)}>Classique · 8 paires</button><button type="button" aria-pressed={pairCount === 12} onClick={() => changeDifficulty(12)}>Expert · 12 paires</button>
      {best !== null && <span className={styles.record}>Record : {best} essais</span>}
    </div>
    <div className={styles.memoryGrid} style={{ gridTemplateColumns: pairCount === 12 ? 'repeat(6, minmax(0, 1fr))' : undefined }} aria-label="Cartes à retourner">
      {cards.map((card, index) => {
        const faceUp = flipped.includes(index) || matched.includes(card.symbol);
        return <button aria-label={faceUp ? `Carte ${card.symbol}` : 'Retourner la carte'} aria-pressed={faceUp} className={`${styles.memoryCard} ${faceUp ? styles.memoryCardOpen : ''} ${matched.includes(card.symbol) ? styles.memoryCardMatched : ''}`} key={card.id} onClick={() => reveal(card, index)} type="button"><span>{faceUp ? card.symbol : 'D'}</span></button>;
      })}
    </div>
    <p className={styles.gameMessage} role="status">{complete ? `Bravo ! ${moves} essais en ${seconds} secondes${best === moves ? ' · nouveau record !' : ''}` : 'Retourne deux cartes et retrouve les symboles identiques.'}</p>
  </section>;
}

function ReflexGame({ game }: { game: DuckFunGame }) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [best, setBest] = useState(0);
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-reflex-${game.slug}`)) || 0); }, [game.slug]);

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
    }), Math.max(300, 820 - game.level * 8 - score * 12));
    return () => window.clearInterval(shuffle);
  }, [game.level, playing, score]);
  useEffect(() => {
    if (!playing || timeLeft > 0) return;
    setPlaying(false);
    if (score > best) { setBest(score); window.localStorage.setItem(`duckfun-reflex-${game.slug}`, String(score)); }
  }, [best, game.slug, playing, score, timeLeft]);

  function start() { setScore(0); setMisses(0); setCombo(0); setTimeLeft(Math.max(12, 30 - Math.floor(game.level / 2))); setTarget(4); setPlaying(true); }
  function tap(index: number) {
    if (!playing) return;
    if (index === target) {
      setCombo(value => value + 1);
      setScore(value => value + 1 + (combo >= 3 ? 1 : 0));
      setTarget((index + 3 + Math.floor(Math.random() * 5)) % 9);
    } else { setMisses(value => value + 1); setCombo(0); }
  }

  return <section className={`${styles.experience} ${styles.reflexExperience}`}>
    <GameHeading game={game} eyebrow="RÉFLEXES"/>
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
  useEffect(() => { setBest(Number(window.localStorage.getItem(`duckfun-stack-${game.slug}`)) || 0); }, [game.slug]);

  useEffect(() => {
    if (!playing) return;
    const speed = Math.min(1 + game.level * 0.07 + blocks.length * 0.1, 4.6);
    const ticker = window.setInterval(() => {
      setMoving(current => {
        let next = current + directionRef.current * speed;
        if (next >= 100 - width) { next = 100 - width; directionRef.current = -1; }
        if (next <= 0) { next = 0; directionRef.current = 1; }
        return next;
      });
    }, 24);
    return () => window.clearInterval(ticker);
  }, [blocks.length, game.level, playing, width]);

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
      if (blocks.length > best) { setBest(blocks.length); window.localStorage.setItem(`duckfun-stack-${game.slug}`, String(blocks.length)); }
      return;
    }
    setBlocks(current => [...current, { left: overlapLeft, width: nextWidth }]);
    if (blocks.length + 1 > best) { setBest(blocks.length + 1); window.localStorage.setItem(`duckfun-stack-${game.slug}`, String(blocks.length + 1)); }
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
    <GameHeading game={game} eyebrow="ADRESSE"/>
    <div className={styles.gameHud}><span><b>{blocks.length}</b> étages</span><span>Record : <b>{best}</b></span><button type="button" onClick={reset}><RotateCcw size={15}/> Recommencer</button></div>
    <div className={styles.stackBoard}>
      <div className={styles.stackSky}><span>DUCKFUN</span><span>ÉTAGE {String(blocks.length + 1).padStart(2, '0')}</span></div>
      {blocks.slice(-8).map((block, index) => <div className={styles.stackBlock} key={index} style={{ width: `${block.width}%`, left: `${block.left}%`, bottom: `${34 + index * 19}px` }}/>) }
      {playing && <div className={`${styles.stackBlock} ${styles.stackMoving}`} style={{ width: `${width}%`, left: `${moving}%`, bottom: 34 + blocks.slice(-8).length * 19 }}/>}
      {!playing && <div className={styles.stackOverlay}><strong>{blocks.length ? `Tour : ${blocks.length} étages` : 'Prêt à empiler ?'}</strong>{blocks.length > 0 && blocks.length >= best && <span>Nouveau record !</span>}<button className={styles.playButton} type="button" onClick={blocks.length ? reset : () => { setPlaying(true); directionRef.current = 1; }}>{blocks.length ? 'Rejouer' : 'Commencer'}</button></div>}
      <div className={styles.stackBase} style={{ left: '18%', width: '64%' }}/>
    </div>
    {playing && <button className={styles.dropButton} type="button" onClick={drop}>Poser le bloc <span>ESPACE</span></button>}
    <p className={styles.gameMessage} role="status">Clique ou appuie sur Espace quand le bloc passe au-dessus de la tour. Record : {best} étages.</p>
  </section>;
}
