import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const blankQuestion = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0 });
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ title: '', description: '', category: '', timeLimit: 10 });
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setMetaField = (k) => (e) => setMeta((m) => ({ ...m, [k]: e.target.value }));
  const patchQuestion = (i, patch) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const setOption = (qi, oi, value) =>
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q))
    );
  const removeQuestion = (i) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.createQuiz({ ...meta, timeLimit: Number(meta.timeLimit) || 0, questions });
      navigate('/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="page narrow">
      <div className="page-head">
        <div>
          <h1>Create a quiz</h1>
          <p className="muted">Mark the correct option for each question. Students never see it until they submit.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        <section className="panel">
          <label className="field">
            <span>Title</span>
            <input value={meta.title} onChange={setMetaField('title')} maxLength={100} required />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea value={meta.description} onChange={setMetaField('description')} rows={2} maxLength={300} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Category</span>
              <input value={meta.category} onChange={setMetaField('category')} placeholder="General" />
            </label>
            <label className="field">
              <span>Time limit in minutes (0 for none)</span>
              <input type="number" min="0" max="240" value={meta.timeLimit} onChange={setMetaField('timeLimit')} />
            </label>
          </div>
        </section>

        {questions.map((q, qi) => (
          <section className="panel" key={qi}>
            <div className="panel-head">
              <h2>Question {qi + 1}</h2>
              {questions.length > 1 && (
                <button type="button" className="btn btn-quiet" onClick={() => removeQuestion(qi)}>Remove</button>
              )}
            </div>
            <label className="field">
              <span>Question text</span>
              <textarea value={q.text} onChange={(e) => patchQuestion(qi, { text: e.target.value })} rows={2} required />
            </label>
            <fieldset className="opt-edit">
              <legend>Options. Select the radio next to the correct one.</legend>
              {q.options.map((opt, oi) => (
                <div className="opt-line" key={oi}>
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => patchQuestion(qi, { correctIndex: oi })}
                    aria-label={`Mark option ${LETTERS[oi]} as correct`}
                  />
                  <input
                    value={opt}
                    onChange={(e) => setOption(qi, oi, e.target.value)}
                    placeholder={`Option ${LETTERS[oi]}`}
                    aria-label={`Option ${LETTERS[oi]}`}
                  />
                </div>
              ))}
            </fieldset>
          </section>
        ))}

        <button type="button" className="btn btn-outline" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}>
          Add another question
        </button>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="actions sticky-actions">
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Publishing' : 'Publish quiz'}</button>
          <Link to="/" className="btn btn-quiet">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
