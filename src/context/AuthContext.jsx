import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token = localStorage.getItem('authToken');
    if (token) {
      // Try to validate token or get user info
      setUser({ id: 'current_user', email: 'user@example.com' }); // Placeholder
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await apiClient.login({ email, password });
      setUser(result.user || { email });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      // For now, use login endpoint (backend should handle registration)
      const result = await apiClient.login({ email, password, name });
      setUser(result.user || { email, name });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      apiClient.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
