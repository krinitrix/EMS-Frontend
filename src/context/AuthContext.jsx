import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  registerAuthHandlers,
  setStoredAuth,
} from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    return token && storedUser ? storedUser : null;
  });

  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    registerAuthHandlers({
      onUnauthorized: (message) => {
        setUser(null);
        setAuthNotice(message);
        showToast(message, 'warning', 'Session Expired');
        navigate('/login', { replace: true });
      },
      onForbidden: (message) => {
        showToast(message, 'danger', 'Access Denied');
      },
    });
  }, [navigate, showToast]);

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password);
    const userInfo = {
      user_id: data.user_id,
      username: data.username,
      email: data.email,
      role: data.role,
    };

    setStoredAuth(data.access, userInfo);
    setUser(userInfo);
    setAuthNotice('');
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setAuthNotice('');
    showToast('You have been logged out.', 'info', 'Signed Out');
    navigate('/login', { replace: true });
  }, [navigate, showToast]);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice('');
  }, []);

  const isAuthenticated = Boolean(user && getStoredToken());

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authNotice,
        clearAuthNotice,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
