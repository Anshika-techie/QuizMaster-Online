import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const isInstructor = user.role === 'instructor';
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.quizzes().then(setQuizzes).catch((e) => setError(e.message));
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set((quizzes || []).map((q) => q.category))],
    [quizzes]
  );
  const visible = useMemo(
    () => (quizzes || []).filter((q) => category === 'All' || q.category === category),
    [quizzes, category]
  );

  const remove = async (quiz) => {
    if (!window.confirm(`Delete "${quiz.title}" and all its attempts? This cannot be undone.`)) return;
    try {
      await api.deleteQuiz(quiz._id);
      setQuizzes((list) => list.filter((q) => q._id !== quiz._id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>{isInstructor ? 'Your quizzes' : `Hi ${user.name.split(' ')[0]}, pick a quiz`}</h1>
          <p className="muted">
            {isInstructor
              ? 'Create quizzes and watch attempts come in. Every attempt is marked automatically.'
              : 'Your score appears the moment you submit.'}
          </p>
        </div>
        {isInstructor && <Link to="/create" className="btn btn-primary">Create quiz</Link>}
      </div>

      {quizzes && categories.length > 2 && (
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} className={`chip ${c === category ? 'is-on' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}

      {!quizzes && !error && (
        <div className="rows" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="row skeleton" />)}
        </div>
      )}

      {quizzes && visible.length === 0 && (
        <div className="empty">
          <h3>No quizzes yet</h3>
          <p>{isInstructor ? 'Create your first quiz to get started.' : 'Your instructor has not published a quiz yet. Check back soon.'}</p>
          {isInstructor && <Link to="/create" className="btn btn-primary">Create quiz</Link>}
        </div>
      )}

      <div className="rows">
        {visible.map((q) => (
          <article key={q._id} className="row">
            <div className="row-main">
              <h3>{q.title}</h3>
              {q.description && <p className="muted">{q.description}</p>}
              <div className="meta">
                <span className="tag">{q.category}</span>
                <span>{q.questionCount} questions</span>
                <span>{q.timeLimit ? `${q.timeLimit} min` : 'No time limit'}</span>
                <span>By {q.author}</span>
              </div>
            </div>
            <div className="row-action">
              {isInstructor ? (
                String(q.authorId) === String(user.id) && (
                  <button className="btn btn-danger" onClick={() => remove(q)}>Delete</button>
                )
              ) : (
                <Link to={`/quiz/${q._id}`} className="btn btn-primary">Start quiz</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
