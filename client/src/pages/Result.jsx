import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ScoreRing from '../components/ScoreRing.jsx';
import { formatDuration } from '../utils.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function verdict(p) {
  if (p >= 80) return 'Excellent work';
  if (p >= 60) return 'Solid result';
  if (p >= 40) return 'Getting there';
  return 'Worth another try';
}

export default function Result() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [result, setResult] = useState(state?.result || null);
  const [error, setError] = useState('');
  const [onlyWrong, setOnlyWrong] = useState(false);

  useEffect(() => {
    if (result) return;
    api.result(id).then(setResult).catch((e) => setError(e.message));
  }, [id, result]);

  if (error) {
    return (
      <main className="page narrow">
        <div className="empty">
          <h3>Could not open this result</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to quizzes</Link>
        </div>
      </main>
    );
  }
  if (!result) return <div className="boot" role="status">Loading result</div>;

  const wrong = result.review.filter((r) => r.selected !== r.correctIndex).length;
  const skipped = result.review.filter((r) => r.selected === -1).length;
  const items = result.review
    .map((r, i) => ({ ...r, number: i + 1 }))
    .filter((r) => !onlyWrong || r.selected !== r.correctIndex);

  return (
    <main className="page">
      <section className="result-hero">
        <ScoreRing percentage={result.percentage} score={result.score} total={result.total} />
        <div className="result-copy">
          <p className="muted">{user.role === 'instructor' ? `${result.userName} on ${result.quizTitle}` : result.quizTitle}</p>
          <h1>{verdict(result.percentage)}</h1>
          <dl className="facts">
            <div><dt>Correct</dt><dd>{result.score}</dd></div>
            <div><dt>Incorrect</dt><dd>{wrong - skipped}</dd></div>
            <div><dt>Skipped</dt><dd>{skipped}</dd></div>
            <div><dt>Time taken</dt><dd>{formatDuration(result.timeTaken)}</dd></div>
          </dl>
          <div className="actions">
            <Link to="/" className="btn btn-primary">Back to quizzes</Link>
            <Link to="/history" className="btn btn-quiet">{user.role === 'instructor' ? 'All attempts' : 'My results'}</Link>
          </div>
        </div>
      </section>

      <section className="review">
        <div className="page-head">
          <h2>Answer review</h2>
          {wrong > 0 && (
            <button className="chip" aria-pressed={onlyWrong} onClick={() => setOnlyWrong((v) => !v)}>
              {onlyWrong ? 'Show all questions' : 'Show only mistakes'}
            </button>
          )}
        </div>

        {items.map((r) => {
          const ok = r.selected === r.correctIndex;
          return (
            <article key={r.number} className={`review-item ${ok ? 'is-ok' : 'is-bad'}`}>
              <h3><span className="qn">Q{r.number}</span> {r.text}</h3>
              <ul>
                {r.options.map((opt, i) => {
                  const isCorrect = i === r.correctIndex;
                  const isPicked = i === r.selected;
                  return (
                    <li key={i} className={isCorrect ? 'correct' : isPicked ? 'picked-wrong' : ''}>
                      <span className="bubble sm" aria-hidden="true">
                        <span className="bubble-fill" style={{ transform: isPicked || isCorrect ? 'scale(1)' : 'scale(0)' }} />
                        <span className="bubble-letter">{LETTERS[i]}</span>
                      </span>
                      <span className="option-text">{opt}</span>
                      {isCorrect && <em>Correct answer</em>}
                      {isPicked && !isCorrect && <em>Your answer</em>}
                    </li>
                  );
                })}
              </ul>
              {r.selected === -1 && <p className="muted small">You did not answer this question.</p>}
            </article>
          );
        })}
      </section>
    </main>
  );
}
