import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const isInstructor = user.role === 'instructor';

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <Logo />
          <span>Quiz Master</span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Quizzes</NavLink>
          <NavLink to="/history">{isInstructor ? 'Attempts' : 'My results'}</NavLink>
          {isInstructor && <NavLink to="/create">Create quiz</NavLink>}
        </nav>
        <div className="nav-user">
          <span className="nav-name">{user.name}</span>
          <button className="btn btn-quiet" onClick={logout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
