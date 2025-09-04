import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

interface AuthContextType {
  login: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ name: 'Test User', id: 1 }); // Mock user
  const [token, setToken] = useState<string | null>('mock-token'); // Mock token
  const isAuthenticated = true;

  const login = async (username?: string, password?: string) => {
    // API call disabled for testing
    console.log('Login function called, but API call is disabled.');
    // try {
    //   const response = await axios.post('http://192.168.0.104/Final%20Code/assets/core/public/api/login', {
    //     username,
    //     password,
    //   });

    //   if (response.data.status === 'success') {
    //     const { user, access_token } = response.data.data;
    //     setUser(user);
    //     setToken(access_token);

    //     await SecureStore.setItemAsync('user', JSON.stringify(user));
    //     await SecureStore.setItemAsync('token', access_token);

    //     router.replace('/(tabs)');
    //   } else {
    //     throw new Error(response.data.message?.error?.join(', ') || 'Invalid credentials');
    //   }
    // } catch (error) {
    //   console.error('Login error:', error);
    //   const errorMessage = error.response?.data?.message?.error?.join(', ') || error.message || 'An unexpected error occurred.';
    //   throw new Error(errorMessage);
    // }
  };

  const logout = async () => {
    // API call disabled for testing
    console.log('Logout function called, but API call is disabled.');
    // if (token) {
    //   try {
    //     await axios.get('http://192.168.0.104/Final%20Code/assets/core/public/api/logout', {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //   } catch (error) {
    //     console.error('Logout failed:', error);
    //   }
    // }
    // setUser(null);
    // setToken(null);
    // await SecureStore.deleteItemAsync('user');
    // await SecureStore.deleteItemAsync('token');
    // router.replace('/(auth)/login');
  };

  const register = async (data: any) => {
    // API call disabled for testing
    console.log('Register function called, but API call is disabled.');
    // try {
    //   const response = await axios.post('http://192.168.0.104/Final%20Code/assets/core/public/api/register', data);

    //   if (response.data.status !== 'success') {
    //     throw new Error(response.data.message?.error?.join(', ') || 'Registration failed');
    //   }
    // } catch (error) {
    //   console.error('Registration error:', error);
    //   const errorMessage = error.response?.data?.message?.error?.join(', ') || error.message || 'An unexpected error occurred.';
    //   throw new Error(errorMessage);
    // }
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, isAuthenticated, user, token }}>
      {children}
    </AuthContext.Provider>
  );
}
