import { useEffect, useState } from 'react';

const R = 84;
const C = 2 * Math.PI * R;

export default function ScoreRing({ percentage, score, total }) {
  const [shown, setShown] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(percentage);
      setCount(score);
      return;
    }
    const DURATION = 1300;
    let raf;
    const start = performance.now() + 250; // short beat before the reveal
    const frame = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(percentage * eased);
      setCount(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [percentage, score]);

  const tone = percentage >= 70 ? 'var(--ok)' : percentage >= 40 ? 'var(--ink)' : 'var(--mark)';

  return (
    <div className="ring" role="img" aria-label={`Score: ${score} out of ${total}, ${percentage} percent`}>
      <svg viewBox="0 0 200 200" width="220" height="220">
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * shown) / 100}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="ring-label">
        <strong>{count}<span>/{total}</span></strong>
        <small>{Math.round(shown)}%</small>
      </div>
    </div>
  );
}
