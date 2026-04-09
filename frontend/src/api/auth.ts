import api from './axios';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
  };
}

export const authApi = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/api/auth/register', data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/api/auth/login', data),

  me: (token?: string) =>
    api.get('/api/auth/me', token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : undefined),
};
