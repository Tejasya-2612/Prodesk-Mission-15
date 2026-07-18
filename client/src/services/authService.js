import api from './api';

export async function registerUser(formData) {
  const response = await api.post('/auth/register', formData);
  return response.data;
}

export async function loginUser(formData) {
  const response = await api.post('/auth/login', formData);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

