import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Question from '../components/Question.jsx';
import Timer from '../components/Timer.jsx';
import Tracker from '../components/Tracker.jsx';

function reducer(state, action) {
  switch (action.type) {
    case 'init':
      return { current: 0, answers: Array(action.n).fill(-1) };
    case 'select': {
      if (state.answers[action.q] === action.opt) return state;
      const answers = state.answers.slice();
      answers[action.q] = action.opt;
      return { ...state, answers };
    }
    case 'go':
      if (action.i < 0 || action.i >= state.answers.length || action.i === state.current) return state;
      return { ...state, current: action.i };
    default:
      return state;
  }
}

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('ready');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, dispatch] = useReducer(reducer, { current: 0, answers: [] });

  // Refs let stable callbacks read the latest values without being recreated.
  const stateRef = useRef(state);
  stateRef.current = state;
  const quizRef = useRef(null);
  quizRef.current = quiz;
  const startedAt = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    let alive = true;
    api
      .quiz(id)
      .then((q) => {
        if (!alive) return;
        setQuiz(q);
        dispatch({ type: 'init', n: q.questions.length });
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  const begin = () => {
    startedAt.current = Date.now();
    setPhase('live');
  };

  const submit = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSubmitting(true);
    setConfirming(false);
    setError('');
    try {
      const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);
      const result = await api.submit(id, { answers: stateRef.current.answers, timeTaken });
      navigate(`/results/${result._id}`, { replace: true, state: { result } });
    } catch (e) {
      setError(e.message);
      busyRef.current = false;
      setSubmitting(false);
    }
  }, [id, navigate]);

  const onSelect = useCallback((q, opt) => dispatch({ type: 'select', q, opt }), []);
  const onJump = useCallback((i) => dispatch({ type: 'go', i }), []);

  // Keyboard: A-D or 1-4 pick an answer, arrow keys move between questions.
  useEffect(() => {
    if (phase !== 'live') return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { current } = stateRef.current;
      const options = quizRef.current?.questions[current]?.options.length || 0;
      const k = e.key.toLowerCase();
      const byLetter = 'abcdef'.indexOf(k);
      const byNumber = Number(k) - 1;
      const pick = byLetter >= 0 && k.length === 1 ? byLetter : byNumber >= 0 && byNumber < 9 ? byNumber : -1;
      if (pick >= 0 && pick < options) dispatch({ type: 'select', q: current, opt: pick });
      else if (e.key === 'ArrowRight') dispatch({ type: 'go', i: current + 1 });
      else if (e.key === 'ArrowLeft') dispatch({ type: 'go', i: current - 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  if (error && !quiz) {
    return (
      <main className="page narrow">
        <div className="empty">
          <h3>Could not load this quiz</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to quizzes</Link>
        </div>
      </main>
    );
  }
  if (!quiz) return <div className="boot" role="status">Loading quiz</div>;

  if (phase === 'ready') {
    return (
      <main className="page narrow">
        <div className="ready">
          <span className="tag">{quiz.category}</span>
          <h1>{quiz.title}</h1>
          {quiz.description && <p className="muted">{quiz.description}</p>}
          <dl className="facts">
            <div><dt>Questions</dt><dd>{quiz.questions.length}</dd></div>
            <div><dt>Time</dt><dd>{quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}</dd></div>
          </dl>
          <p className="muted">
            Pick an answer for each question. You can move back and change any answer before you submit.
            {quiz.timeLimit > 0 && ' The quiz submits by itself when the timer runs out.'}
          </p>
          <div className="actions">
            <button className="btn btn-primary btn-lg" onClick={begin}>Begin quiz</button>
            <Link to="/" className="btn btn-quiet">Back</Link>
          </div>
        </div>
      </main>
    );
  }

  const { current, answers } = state;
  const total = quiz.questions.length;
  const answered = answers.filter((a) => a >= 0).length;
  const isLast = current === total - 1;
  const q = quiz.questions[current];

  return (
    <div className="player">
      <header className="player-bar">
        <div className="player-title">
          <strong>{quiz.title}</strong>
          <span>{answered} of {total} answered</span>
        </div>
        {quiz.timeLimit > 0 && <Timer seconds={quiz.timeLimit * 60} onExpire={submit} />}
        <div className="progress" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </header>

      <div className="player-body">
        <aside className="player-side">
          <h2 className="side-title">Answer sheet</h2>
          <Tracker answers={answers} current={current} onJump={onJump} />
          <p className="muted small">Filled bubbles are answered. Use A to D, or 1 to 4, and the arrow keys to move faster.</p>
        </aside>

        <main className="player-main">
          <Question
            index={current}
            total={total}
            text={q.text}
            options={q.options}
            selected={answers[current]}
            onSelect={onSelect}
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="player-nav">
            <button className="btn btn-quiet" onClick={() => onJump(current - 1)} disabled={current === 0}>
              Previous
            </button>
            {isLast ? (
              <button className="btn btn-primary" onClick={() => setConfirming(true)} disabled={submitting}>
                {submitting ? 'Submitting' : 'Submit quiz'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => onJump(current + 1)}>Next</button>
            )}
          </div>
          {!isLast && answered === total && (
            <button className="link submit-early" onClick={() => setConfirming(true)}>
              All questions answered. Submit now
            </button>
          )}
        </main>
      </div>

      {confirming && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirming(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirm-title">Submit your quiz?</h2>
            <p className="muted">
              {answered === total
                ? `You answered all ${total} questions.`
                : `${total - answered} of ${total} questions are still unanswered and will count as incorrect.`}
            </p>
            <div className="actions">
              <button className="btn btn-primary" onClick={submit} autoFocus>Submit and see score</button>
              <button className="btn btn-quiet" onClick={() => setConfirming(false)}>Keep working</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
