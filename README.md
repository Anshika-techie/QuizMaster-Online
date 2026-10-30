# Quiz Master Online

A full-stack online examination platform. Instructors create quizzes, students take them, and every attempt is marked automatically the moment it is submitted.

**Stack:** React.js (Vite) · Node.js + Express · MongoDB (Mongoose) · HTML5 · CSS3 · JavaScript

## What it does

- Instant automated scoring on the server, with a full answer review after submission
- Two roles: students take quizzes and see their history; instructors create quizzes and review every attempt on them
- Answer sheet navigator with live progress, so any question is one click away
- Countdown timer that auto-submits when time runs out
- Keyboard shortcuts: A to D (or 1 to 4) to answer, arrow keys to move between questions
- Correct answers never leave the server until a quiz is submitted
- JWT authentication, bcrypt password hashing, role-protected routes
- Responsive from phone to desktop, respects reduced-motion settings

## Performance notes (state and re-renders)

- Quiz state lives in a single `useReducer`; selecting an answer returns the same state object when nothing changed
- The countdown `Timer` owns its own tick state, so the question area does not re-render every second
- `Question`, `Tracker` and `Timer` are wrapped in `React.memo`, and all handlers passed to them are stable `useCallback`s
- Keyboard handling and auto-submit read the latest state through refs instead of re-binding listeners

## Run it locally (2 commands)

You only need Node 18+. No MongoDB install, no config files.

```bash
npm run setup     # installs root, server and client packages
npm run dev       # starts API (port 5000) and app (port 5173) together
```

Open http://localhost:5173

- On the first run the server downloads a local MongoDB once (about a minute, internet needed). After that it starts in seconds.
- Your data is saved in `server/.data`, so it survives restarts. Delete that folder to start fresh.
- Demo data is added automatically when the database is empty. `npm run seed --prefix server` resets it.
- To use your own MongoDB or Atlas instead, copy `server/.env.example` to `server/.env` and set `MONGO_URI`.

**Demo accounts** (password `demo1234`)

| Role | Email |
| --- | --- |
| Student | student@quizmaster.dev |
| Instructor | instructor@quizmaster.dev |

## Project structure

```
server/
  index.js            Express app and route wiring
  seed.js             Demo users and quizzes (auto-runs on empty DB)
  config/db.js        MongoDB connection
  middleware/auth.js  JWT check and role guard
  models/             User, Quiz, Result
  routes/             auth, quizzes, results (scoring lives here)
client/
  src/
    api.js            Fetch wrapper
    AuthContext.jsx   Session state
    components/       Question, Tracker, Timer, ScoreRing, Navbar, Logo
    pages/            Auth, Dashboard, QuizPlayer, Result, History, CreateQuiz
    styles.css        Design tokens and all styling
```

## API

| Method | Route | Access |
| --- | --- | --- |
| POST | /api/auth/register, /api/auth/login | Public |
| GET | /api/auth/me | Logged in |
| GET | /api/quizzes, /api/quizzes/:id | Logged in |
| POST | /api/quizzes | Instructor |
| DELETE | /api/quizzes/:id | Instructor (owner) |
| POST | /api/results/:quizId/submit | Student |
| GET | /api/results/mine, /api/results/:id | Owner or quiz instructor |

## Deploying

Set `VITE_API_URL` in the client build to your hosted API URL (for example `https://api.example.com/api`), and set `CLIENT_URL` on the server to your frontend origin.
