import { request } from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data.token) {
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
    }

    return res.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentAdmin: (): AdminUser | null => {
    const stored = localStorage.getItem('admin_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },

  isAuthenticated: (): boolean => {
    return Boolean(localStorage.getItem('admin_token'));
  },

  fetchProfile: async (): Promise<AdminUser> => {
    const res = await request<{ admin: AdminUser }>('/auth/me');
    return res.data.admin;
  },
};
