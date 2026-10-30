import { memo } from 'react';

// Answer sheet: one bubble per question. Filled bubble = answered, ringed = current.
function Tracker({ answers, current, onJump }) {
  return (
    <div className="tracker" role="group" aria-label="Question navigator">
      {answers.map((a, i) => (
        <button
          key={i}
          type="button"
          className={`tracker-dot ${a >= 0 ? 'is-answered' : ''} ${i === current ? 'is-current' : ''}`}
          onClick={() => onJump(i)}
          aria-label={`Question ${i + 1}, ${a >= 0 ? 'answered' : 'not answered'}`}
          aria-current={i === current ? 'step' : undefined}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export default memo(Tracker);
