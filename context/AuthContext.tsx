import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setIsAuthenticated(!!token);
      } catch (e) {
        console.error('Failed to fetch auth token:', e);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (token) => {
    await SecureStore.setItemAsync('userToken', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
