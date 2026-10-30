import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuizPlayer from './pages/QuizPlayer.jsx';
import Result from './pages/Result.jsx';
import History from './pages/History.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';

function Protected({ role, children }) {
  const { user, checking } = useAuth();
  if (checking) return <div className="boot" role="status">Loading</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const focusMode = pathname.startsWith('/quiz/');

  return (
    <>
      {user && !focusMode && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/quiz/:id" element={<Protected role="student"><QuizPlayer /></Protected>} />
        <Route path="/results/:id" element={<Protected><Result /></Protected>} />
        <Route path="/history" element={<Protected><History /></Protected>} />
        <Route path="/create" element={<Protected role="instructor"><CreateQuiz /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
