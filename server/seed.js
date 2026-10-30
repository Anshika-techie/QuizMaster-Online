import 'dotenv/config';
import { pathToFileURL } from 'url';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';
import connectDB, { disconnectDB } from './config/db.js';

const q = (text, options, correctIndex) => ({ text, options, correctIndex });

const quizzes = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Types, scope, promises and the quirks every developer meets sooner or later.',
    category: 'JavaScript',
    timeLimit: 8,
    questions: [
      q('What does typeof null return?', ['"null"', '"object"', '"undefined"', '"number"'], 1),
      q('Which array method returns a new array built from the results of a function?', ['map', 'forEach', 'filter', 'reduce'], 0),
      q('What is the result of 0.1 + 0.2 === 0.3 ?', ['true', 'false', 'undefined', 'It throws a TypeError'], 1),
      q('Which keyword declares a block-scoped variable that cannot be reassigned?', ['var', 'let', 'const', 'static'], 2),
      q('What happens to Promise.all when one of its promises rejects?', ['It waits for the rest, then resolves', 'It rejects immediately with that reason', 'It ignores the rejection', 'It retries the promise'], 1),
      q('What is a closure?', ['A function that keeps access to variables from its outer scope', 'A way to close a browser tab', 'A private class field', 'A loop that never ends'], 0),
      q('Which of these values is falsy?', ['"0"', '[]', '""', '{}'], 2),
    ],
  },
  {
    title: 'React Essentials',
    description: 'Hooks, rendering and the habits that keep a React interface fast.',
    category: 'React',
    timeLimit: 7,
    questions: [
      q('Which hook stores local state in a function component?', ['useState', 'useRef', 'useMemo', 'useContext'], 0),
      q('When does useEffect with an empty dependency array run?', ['After every render', 'Once, after the first render', 'Never', 'Before the first render'], 1),
      q('Why do items in a rendered list need a key prop?', ['To style them differently', 'To help React match items between renders', 'To make them clickable', 'To sort them alphabetically'], 1),
      q('Which tool skips re-rendering a component when its props are unchanged?', ['useEffect', 'React.memo', 'useReducer', 'Fragment'], 1),
      q('Which hook gives you a function that keeps the same reference between renders?', ['useCallback', 'useId', 'useLayoutEffect', 'useDebugValue'], 0),
      q('Where should state live when two sibling components need to share it?', ['In each sibling separately', 'In localStorage only', 'In their closest common parent', 'In a global variable'], 2),
    ],
  },
  {
    title: 'Node.js and MongoDB Basics',
    description: 'Servers, middleware and how documents are stored and queried.',
    category: 'Backend',
    timeLimit: 7,
    questions: [
      q('What does app.use(express.json()) do in Express?', ['Serves static files', 'Parses JSON request bodies', 'Enables CORS', 'Compresses responses'], 1),
      q('In what format does MongoDB store documents internally?', ['CSV', 'XML', 'BSON', 'YAML'], 2),
      q('What does the Mongoose .lean() method return?', ['Plain JavaScript objects', 'Smaller schemas', 'Only the _id field', 'A promise that never resolves'], 0),
      q('Which HTTP status code means the request is missing valid login credentials?', ['200', '401', '404', '500'], 1),
      q('What is the main job of the Node.js event loop?', ['Compiling TypeScript', 'Running queued callbacks while keeping the main thread free', 'Managing the database', 'Bundling modules'], 1),
      q('Why are passwords hashed with bcrypt before saving?', ['To make them shorter', 'So a leaked database does not reveal the original passwords', 'To speed up login', 'Because MongoDB requires it'], 1),
    ],
  },
];

export async function seedDemo() {
  const emails = ['instructor@quizmaster.dev', 'student@quizmaster.dev'];
  const old = await User.find({ email: { $in: emails } });
  const oldIds = old.map((u) => u._id);
  await Result.deleteMany({ $or: [{ user: { $in: oldIds } }, { instructor: { $in: oldIds } }] });
  await Quiz.deleteMany({ createdBy: { $in: oldIds } });
  await User.deleteMany({ email: { $in: emails } });

  const password = await bcrypt.hash('demo1234', 10);
  const instructor = await User.create({ name: 'Anika Rao', email: emails[0], password, role: 'instructor' });
  await User.create({ name: 'Rohan Mehta', email: emails[1], password, role: 'student' });

  await Quiz.insertMany(quizzes.map((quiz) => ({ ...quiz, createdBy: instructor._id })));
}

// `npm run seed` resets the demo data manually
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  connectDB()
    .then(seedDemo)
    .then(() => {
      console.log('Demo data reset. Logins (password demo1234): student@quizmaster.dev, instructor@quizmaster.dev');
      return disconnectDB();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
