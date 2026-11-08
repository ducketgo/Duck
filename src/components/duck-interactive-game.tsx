'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, X, Volume2 } from 'lucide-react';

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  color: string;
};

export function DuckInteractiveGame() {
  const [clicks, setClicks] = useState(0);
  const [duckBonus, setDuckBonus] = useState(0);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [quackText, setQuackText] = useState<string | null>(null);

  // Play subtle sound or quack effect with Web Audio API (pas besoin d'asset externe)
  const playSynthesizedQuack = (pitchMultiplier = 1) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Duck quack fundamental frequency sweep
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, now + 0.14);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio might be blocked before first user gesture
    }
  };

  const handleDuckClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newClicks = clicks + 1;
    const newBonus = duckBonus + 1;
    const newCombo = combo + 1;
    setClicks(newClicks);
    setDuckBonus(newBonus);
    setCombo(newCombo);

    playSynthesizedQuack(1 + Math.min(newCombo * 0.08, 0.8));

    // Funny quotes from the duck
    const quacks = ['Coin ! 🦆', 'Super Duck ! ✨', 'Duck Speed ! ⚡', 'Duck Power ! 🚀', 'Wouah ! 🔥', 'Coin Coin ! 🎯'];
    const chosen = quacks[Math.floor(Math.random() * quacks.length)];
    setQuackText(chosen);
    setTimeout(() => setQuackText(null), 1200);

    // Particle burst
    const rect = e.currentTarget.getBoundingClientRect();
    const burst: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.8) * 80,
      text: ['🦆', '✨', '+1', '⭐', '⚡'][Math.floor(Math.random() * 5)],
      color: ['#41d8e5', '#a28bfa', '#6be0b2', '#ffd166'][Math.floor(Math.random() * 4)],
    }));

    setParticles(prev => [...prev, ...burst]);

    if (newClicks === 10 || newClicks === 25 || newClicks === 50) {
      setShowRewardModal(true);
    }
  };

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles(prev => prev.slice(6));
    }, 900);
    return () => clearTimeout(timer);
  }, [particles]);

  // Combo timeout
  useEffect(() => {
    if (combo === 0) return;
    const timeout = setTimeout(() => {
      setCombo(0);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [combo]);

  return (
    <>
      {/* Floating mini duck button badge */}
      <div className="duck-clicker-widget" title="Clique sur Duck pour le mini-jeu et débloquer des points !">
        <button 
          onClick={handleDuckClick}
          className={`duck-clicker-button ${combo > 3 ? 'duck-on-fire' : ''}`}
          aria-label="Cliquer sur le canard DUCK pour jouer"
        >
          <span className="duck-mascot-emoji">🦆</span>
          {combo > 1 && <span className="duck-combo-badge">x{combo}</span>}
        </button>
        {duckBonus > 0 && (
          <span className="duck-score-pill">
            <Sparkles size={11} /> {duckBonus}
          </span>
        )}
        {quackText && <div className="duck-quack-balloon">{quackText}</div>}
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="duck-particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            color: p.color,
          } as React.CSSProperties}
        >
          {p.text}
        </span>
      ))}

      {/* Secret achievement popup */}
      {showRewardModal && (
        <div className="duck-easter-egg-modal-backdrop" onClick={() => setShowRewardModal(false)}>
          <div className="duck-easter-egg-modal" onClick={e => e.stopPropagation()}>
            <button className="duck-modal-close" onClick={() => setShowRewardModal(false)}>
              <X size={18} />
            </button>
            <div className="duck-trophy-icon">
              <Trophy size={42} />
            </div>
            <h2>Félicitations Duckeur ! 🎉</h2>
            <p>
              Tu as cliqué <strong>{clicks} fois</strong> sur le Duck secret. Tu as débloqué le succès exclusif 
              <em> « Maître du Coin »</em> !
            </p>
            <div className="duck-secret-badge">
              <span>🦆 Succès Débloqué</span>
              <small>+ {clicks * 5} points de style dans ton DeskDuck</small>
            </div>
            <button className="button" style={{ marginTop: '16px', width: '100%' }} onClick={() => setShowRewardModal(false)}>
              Génial, continuer à explorer !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
