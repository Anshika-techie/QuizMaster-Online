import { memo, useEffect, useRef, useState } from 'react';

// Owns its own ticking state so the question area never re-renders each second.
function Timer({ seconds, onExpire }) {
  const endAt = useRef(Date.now() + seconds * 1000);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    endAt.current = Date.now() + seconds * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        expireRef.current();
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [seconds]);

  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');

  return (
    <div className={`timer ${left <= 60 ? 'timer-low' : ''}`} role="timer" aria-label={`${m} minutes ${s} seconds left`}>
      {m}:{s}
    </div>
  );
}

export default memo(Timer);
