import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { heartbeat } from '../api/status';
import apiClient from '../api/client';

const AuthContext = createContext(null);

// Auto-detect role by probing both protected home endpoints
async function detectRole() {
  try {
    await apiClient.get('/driver/');
    return 'driver';
  } catch (e1) {
    if (e1.response?.status === 403 || e1.response?.status === 401) {
      // not a driver — skip
    }
  }
  try {
    await apiClient.get('/rider/');
    return 'rider';
  } catch (e2) {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [roleLoading, setRoleLoading] = useState(false);

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  // After login, if role is not yet known, detect it automatically
  useEffect(() => {
    if (isAuthenticated && !role && !roleLoading) {
      setRoleLoading(true);
      detectRole().then((detectedRole) => {
        if (detectedRole) {
          const updated = { ...user, role: detectedRole };
          localStorage.setItem('user', JSON.stringify(updated));
          setUser(updated);
        }
        setRoleLoading(false);
      });
    }
  }, [isAuthenticated, role]);

  const saveAuth = useCallback((tokenData, userData) => {
    localStorage.setItem('access_token', tokenData.access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenData.access_token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('driver_area');
    setToken(null);
    setUser(null);
  }, []);

  // Heartbeat every 4 minutes to keep session alive
  useEffect(() => {
    if (!isAuthenticated) return;
    const ping = () => heartbeat().catch(() => {});
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, token, role, roleLoading, isAuthenticated, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
