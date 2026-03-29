import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      const { token, user } = data.data;
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const errors = err.response?.data?.errors || [];
      setError(errors.length ? errors.join(', ') : msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', formData);
      const { token, user } = data.data;
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
