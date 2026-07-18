import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function register(formData) {
    const data = await registerUser(formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function login(formData) {
    const data = await loginUser(formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

