import { create } from 'zustand';
import api from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (data: { name: string; email: string }) => {
    const response = await api.put<User>('/api/auth/profile', data);
    set({ user: response.data });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
}));

export default useAuthStore; 