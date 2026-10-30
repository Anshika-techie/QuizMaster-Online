import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { formatDuration } from '../utils.js';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function History() {
  const { user } = useAuth();
  const isInstructor = user.role === 'instructor';
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myResults().then(setItems).catch((e) => setError(e.message));
  }, []);

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>{isInstructor ? 'Attempts on your quizzes' : 'My results'}</h1>
          <p className="muted">
            {isInstructor ? 'Open any attempt to see exactly how the student answered.' : 'Every quiz you have submitted, newest first.'}
          </p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {!items && !error && <div className="rows" aria-busy="true"><div className="row skeleton" /><div className="row skeleton" /></div>}

      {items && items.length === 0 && (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>{isInstructor ? 'Attempts show up here as soon as a student submits one of your quizzes.' : 'Take a quiz and your result will be saved here.'}</p>
          {!isInstructor && <Link to="/" className="btn btn-primary">Browse quizzes</Link>}
        </div>
      )}

      <div className="rows">
        {items?.map((r) => (
          <Link key={r._id} to={`/results/${r._id}`} className="row row-link">
            <div className="row-main">
              <h3>{r.quizTitle}</h3>
              <div className="meta">
                {isInstructor && <span>{r.studentName}</span>}
                <span>{fmtDate(r.createdAt)}</span>
                <span>{formatDuration(r.timeTaken)}</span>
              </div>
            </div>
            <div className={`score-pill ${r.percentage >= 70 ? 'good' : r.percentage < 40 ? 'low' : ''}`}>
              {r.score}/{r.total}
              <small>{r.percentage}%</small>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
