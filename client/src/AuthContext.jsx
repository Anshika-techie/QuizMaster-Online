import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function clearSession() {
  localStorage.removeItem('qm_token');
  localStorage.removeItem('qm_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qm_user'));
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(() => !!localStorage.getItem('qm_token'));

  useEffect(() => {
    if (!localStorage.getItem('qm_token')) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('qm_user', JSON.stringify(user));
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const persist = useCallback(({ token, user }) => {
    localStorage.setItem('qm_token', token);
    localStorage.setItem('qm_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, persist, logout }), [user, checking, persist, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
