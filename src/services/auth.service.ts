import api from './api';
import { UserRole } from '../app/context/AuthContext';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, role: string) => {
  const backendRole = role === 'customer' ? 'user' : 'admin';
  const response = await api.post('/auth/register', { name, email, password, role: backendRole });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
