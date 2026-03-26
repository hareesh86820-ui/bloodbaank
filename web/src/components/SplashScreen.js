import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('out'), 2400);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      ...S.wrap,
      opacity: phase === 'out' ? 0 : 1,
      transform: phase === 'out' ? 'scale(1.04)' : 'scale(1)',
      transition: phase === 'out' ? 'opacity 0.6s ease, transform 0.6s ease' : 'none'
    }}>
      {/* Background glow orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />

      {/* Logo SVG */}
      <div style={{
        ...S.logoWrap,
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'scale(0.7) translateY(20px)' : 'scale(1) translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle flame shape */}
          <defs>
            <radialGradient id="redGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#cc0022" />
            </radialGradient>
            <radialGradient id="blueGrad" cx="60%" cy="70%" r="70%">
              <stop offset="0%" stopColor="#5ac8fa" />
              <stop offset="100%" stopColor="#0a84ff" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Red flame / drop left */}
          <path d="M100 20 C60 40, 30 70, 35 110 C40 145, 70 165, 100 165 C80 140, 75 115, 85 95 C90 80, 100 70, 100 20Z"
            fill="url(#redGrad)" filter="url(#glow)" opacity="0.95" />

          {/* Arrow up-right */}
          <path d="M100 20 L145 55 L125 55 L125 90 L115 90 L115 55 L100 55Z"
            fill="url(#redGrad)" opacity="0.9" />

          {/* Blue teardrop right */}
          <path d="M100 165 C130 165, 165 140, 165 105 C165 70, 140 50, 115 45 C130 65, 135 90, 125 110 C115 130, 100 145, 100 165Z"
            fill="url(#blueGrad)" filter="url(#glow)" opacity="0.9" />

          {/* Center shield/location pin */}
          <path d="M100 75 C88 75, 78 85, 78 97 C78 115, 100 130, 100 130 C100 130, 122 115, 122 97 C122 85, 112 75, 100 75Z"
            fill="rgba(10,10,20,0.85)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* Heartbeat line inside shield */}
          <polyline points="84,97 89,97 92,88 96,106 100,92 104,102 107,97 116,97"
            stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Blood drop at bottom of shield */}
          <path d="M100 122 C97 118, 93 114, 93 111 C93 107.5, 96.5 105, 100 105 C103.5 105, 107 107.5, 107 111 C107 114, 103 118, 100 122Z"
            fill="#ff2d55" />
        </svg>

        {/* Brand name */}
        <div style={S.brandRow}>
          <span style={S.brandText}>HEM</span>
          <span style={S.brandDrop}>🩸</span>
          <span style={S.brandText}>RA</span>
        </div>
        <div style={S.tagline}>BLOOD DONOR · HOSPITAL · BLOOD BANK · ALERT</div>

        {/* Loading bar */}
        <div style={S.barWrap}>
          <div style={{
            ...S.barFill,
            width: phase === 'hold' || phase === 'out' ? '100%' : '0%',
            transition: phase === 'hold' ? 'width 1.6s ease' : 'none'
          }} />
        </div>
      </div>
    </div>
  );
}

const S = {
  wrap: { position: 'fixed', inset: 0, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, flexDirection: 'column' },
  orb1: { position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  orb2: { position: 'absolute', bottom: '20%', right: '20%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  logoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  brandRow: { display: 'flex', alignItems: 'center', gap: 0, marginTop: 8 },
  brandText: { fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: 4, fontFamily: 'Inter, sans-serif' },
  brandDrop: { fontSize: 32, margin: '0 2px', lineHeight: 1 },
  tagline: { fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textAlign: 'center', marginTop: 2, fontFamily: 'Inter, sans-serif' },
  barWrap: { width: 160, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 24, overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #ff2d55, #0a84ff)', borderRadius: 2 }
};
