import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: rehydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem('bookworm_token');
    const savedUser = localStorage.getItem('bookworm_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bookworm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const { token, user: userData } = res.data;
    localStorage.setItem('bookworm_token', token);
    localStorage.setItem('bookworm_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('bookworm_token', token);
    localStorage.setItem('bookworm_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const guestLogin = useCallback(async () => {
    const res = await authService.guestLogin();
    const { token, user: userData } = res.data;
    localStorage.setItem('bookworm_token', token);
    localStorage.setItem('bookworm_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('bookworm_token');
    localStorage.removeItem('bookworm_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('bookworm_user', JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isGuest: user?.is_guest || false,
      login,
      register,
      guestLogin,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
