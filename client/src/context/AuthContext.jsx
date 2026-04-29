import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('lms_user', JSON.stringify(res.data));
        } catch (error) {
          console.error("Failed to fetch user context", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  };

  const signup = async (name, email, password) => {
    const res = await axiosInstance.post('/auth/signup', { name, email, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data);
        localStorage.setItem('lms_user', JSON.stringify(res.data));
      } catch (error) {
        console.error("Failed to refresh user", error);
      }
    }
  };

  const updateProfile = async (updateData) => {
    const res = await axiosInstance.put('/auth/me', updateData);
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, signup, logout, isLoading, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
