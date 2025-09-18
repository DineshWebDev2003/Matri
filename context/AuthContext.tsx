import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';

interface AuthContextType {
  login: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  clearAuth: () => Promise<void>;
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const storedToken = await SecureStore.getItemAsync('token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    }
  };

  const login = async (username?: string, password?: string) => {
    try {
      console.log('🔐 Attempting login with:', username);
      const response = await apiService.login(username!, password!);
      console.log('📡 Login API response:', response);

      if (response.status === 'success') {
        const { user, access_token } = response.data;
        console.log('✅ Login successful! User:', user);
        console.log('🔑 Access token:', access_token);
        
        setUser(user);
        setToken(access_token);
        setIsAuthenticated(true);

        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('token', access_token);

        console.log('🚀 Redirecting to tabs...');
        router.replace('/(tabs)');
      } else {
        console.log('❌ Login failed:', response);
        throw new Error(response.message?.error?.join(', ') || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      const errorMessage = error.response?.data?.message?.error?.join(', ') || error.message || 'An unexpected error occurred.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    mobile: string;
    mobile_code: string;
    country_code: string;
    country: string;
    agree?: boolean;
    reference?: string;
  }) => {
    try {
      console.log('📝 Attempting registration with:', userData.email, userData.username);
      const response = await apiService.register(userData);
      console.log('📡 Registration API response:', response);
      
      if (response.status === 'success') {
        const { user, access_token } = response.data;
        setUser(user);
        setToken(access_token);
        setIsAuthenticated(true);
        
        // Store user data and token securely
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('token', access_token);
        
        console.log('✅ Registration successful, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message?.error?.join(', ') || 'Registration failed');
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    router.replace('/(auth)/login');
  };


  const clearAuth = async () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, clearAuth, isAuthenticated, user, token }}>
      {children}
    </AuthContext.Provider>
  );
}
