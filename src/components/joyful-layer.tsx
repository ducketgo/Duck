'use client';

import { useEffect, useState, useCallback } from 'react';

const FUN_EMOJIS = ['🦆', '✨', '🎉', '⭐', '💫', '🎊', '🌈', '🎵', '🚀', '💖', '🍭', '🐾'];
const TOASTS = [
  'Coin coin ! Tu cliques bien aujourd’hui 🦆',
  'Duck power activé ⚡',
  'Un petit clic pour le canard, un grand pas pour la bonne humeur ✨',
  'Attention, bonne ambiance détectée 🎉',
  'Le canard te fait un clin d’œil 😄',
  'Continue, tu gagnes des points de style ! 🏆',
  'DuckFun t’attend pour une pause jeu 🎮',
  'Souris et amuse-toi, c’est gratuit ! 🌈',
];

type Confetti = { id: number; x: number; y: number; emoji: string; delay: number };

export function JoyfulLayer() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [bubbles, setBubbles] = useState<{ id: number; left: number; top: number; emoji: string; duration: number }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const spawnConfetti = useCallback((x: number, y: number, count = 8) => {
    const burst: Confetti[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
      emoji: FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)],
      delay: Math.random() * 0.3,
    }));
    setConfetti(prev => [...prev, ...burst].slice(-60));
    setTimeout(() => setConfetti(prev => prev.filter(c => !burst.includes(c))), 3400);
  }, []);

  // Periodic floating bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          top: 100 + Math.random() * 10,
          emoji: FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)],
          duration: 8 + Math.random() * 6,
        }];
        return next.slice(-12);
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Clean old bubbles
  useEffect(() => {
    const t = setInterval(() => {
      setBubbles(prev => prev.slice(Math.max(0, prev.length - 12)));
    }, 9000);
    return () => clearInterval(t);
  }, []);

  // Click anywhere -> confetti (throttled)
  useEffect(() => {
    let last = 0;
    const handler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 450) return;
      // Only trigger on interactive elements or random 25% of clicks
      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('a,button,[role="button"]');
      if (!isInteractive && Math.random() > 0.25) return;
      last = now;
      spawnConfetti(e.clientX, e.clientY, isInteractive ? 10 : 5);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [spawnConfetti]);

  // Random toast
  useEffect(() => {
    const show = () => {
      setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
      setTimeout(() => setToast(null), 3000);
    };
    const first = setTimeout(show, 6000);
    const interval = setInterval(show, 22000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, []);

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    spawnConfetti(window.innerWidth - 60, window.innerHeight - 160, 16);
    setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)]);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <div className="joy-layer" aria-hidden="true">
        {bubbles.map(b => (
          <span
            key={b.id}
            className="joy-bubble"
            style={{
              left: `${b.left}%`,
              bottom: `-${b.top}px`,
              animationDuration: `${b.duration}s`,
            }}
          >
            {b.emoji}
          </span>
        ))}
      </div>

      {confetti.map(c => (
        <span
          key={c.id}
          className="joy-confetti"
          style={{ left: `${c.x}px`, top: `${c.y}px`, animationDelay: `${c.delay}s` }}
        >
          {c.emoji}
        </span>
      ))}

      {toast && <div className="joy-toast" role="status">{toast}</div>}

      <div className="joy-mascot" onClick={handleMascotClick} title="Clique-moi pour la bonne humeur !">
        🦆
      </div>
    </>
  );
}