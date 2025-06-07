import api from '../api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Backend trả về { message, token, user }
};

export const register = async (username: string, full_name: string, email: string, password: string, role: 'buyer' | 'seller') => {
  const response = await api.post('/auth/register', { username, full_name, email, password, role });
  return response.data;
};