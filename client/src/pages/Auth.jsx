import { useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const ROWS = 8;
const COLS = 6;

// A decorative answer sheet. A handful of bubbles fill in once on page load.
function Sheet() {
  const cells = useMemo(() => {
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      const pick = Math.floor(Math.random() * COLS);
      for (let c = 0; c < COLS; c++) {
        out.push({ key: `${r}-${c}`, filled: c === pick, delay: 350 + r * 170 });
      }
    }
    return out;
  }, []);

  return (
    <div className="sheet" aria-hidden="true">
      {cells.map((cell) => (
        <span
          key={cell.key}
          className={`sheet-bubble ${cell.filled ? 'is-filled' : ''}`}
          style={cell.filled ? { animationDelay: `${cell.delay}ms` } : undefined}
        />
      ))}
    </div>
  );
}

export default function Auth() {
  const { persist } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);
      persist(data);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const fillDemo = (role) =>
    setForm((f) => ({ ...f, email: `${role}@quizmaster.dev`, password: 'demo1234' }));

  return (
    <main className="auth">
      <aside className="auth-side">
        <div className="auth-brand"><Logo size={32} /><span>Quiz Master</span></div>
        <Sheet />
        <h1>Take the quiz. See your score the moment you submit.</h1>
        <p>Instructors build quizzes. Students answer them. Marking happens instantly, no waiting for a grader.</p>
      </aside>

      <section className="auth-main">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h2>{mode === 'login' ? 'Log in' : 'Create your account'}</h2>

          {mode === 'register' && (
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set('name')} autoComplete="name" required />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>

          {mode === 'register' && (
            <fieldset className="segmented">
              <legend>I am a</legend>
              {['student', 'instructor'].map((r) => (
                <label key={r} className={form.role === r ? 'is-on' : ''}>
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={set('role')} />
                  {r === 'student' ? 'Student' : 'Instructor'}
                </label>
              ))}
            </fieldset>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          <p className="switch">
            {mode === 'login' ? 'New here?' : 'Already registered?'}{' '}
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>

          {mode === 'login' && (
            <div className="demo">
              <span>Try the demo accounts (after running the seed script)</span>
              <div>
                <button type="button" className="btn btn-quiet" onClick={() => fillDemo('student')}>Fill student</button>
                <button type="button" className="btn btn-quiet" onClick={() => fillDemo('instructor')}>Fill instructor</button>
              </div>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
