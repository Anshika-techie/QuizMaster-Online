import { memo } from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Only re-renders when the question, or the selected option, changes.
function Question({ index, total, text, options, selected, onSelect }) {
  return (
    <section className="question" key={index} aria-labelledby="q-text">
      <p className="question-count">Question {index + 1} of {total}</p>
      <h2 id="q-text" className="question-text">{text}</h2>
      <div className="options" role="radiogroup" aria-labelledby="q-text">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className={`option ${selected === i ? 'is-selected' : ''}`}
            onClick={() => onSelect(index, i)}
          >
            <span className="bubble" aria-hidden="true">
              <span className="bubble-fill" />
              <span className="bubble-letter">{LETTERS[i]}</span>
            </span>
            <span className="option-text">{opt}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default memo(Question);
