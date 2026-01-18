
import { apiClient } from './apiClient';
import { UserProfile } from '../types';

export const authService = {
  login: async (email: string, pass: string): Promise<{ user: UserProfile; token: string }> => {
    const data = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (email: string, pass: string): Promise<{ user: UserProfile; token: string }> => {
    const data = await apiClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return apiClient.request('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.reload();
  }
};
