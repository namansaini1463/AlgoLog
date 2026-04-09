import api from './axios';
import type { Page, ProblemBank } from './bank';

export interface ProblemBankRequest {
  title: string;
  slug?: string;
  difficulty: string;
  topic: string;
  tags?: string[];
  platform?: string;
  platformUrl?: string;
  description?: string;
}

export interface TopicDto {
  id: string;
  name: string;
  colorHex: string;
}

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  problemCount: number;
  lastActive: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalProblems: number;
  activeToday: number;
  topTopics: { topic: string; count: number }[];
}

export interface ReportDto {
  id: string;
  userId: string;
  userEmail: string;
  bankProblemId: string;
  problemTitle: string;
  reason: string;
  status: string;
  createdAt: string;
}

export const adminApi = {
  // Problem Bank
  getProblems: (params?: Record<string, string | number>) =>
    api.get<Page<ProblemBank>>('/api/admin/bank', { params }),
  createProblem: (data: ProblemBankRequest) =>
    api.post<ProblemBank>('/api/admin/bank', data),
  updateProblem: (id: string, data: ProblemBankRequest) =>
    api.put<ProblemBank>(`/api/admin/bank/${id}`, data),
  deleteProblem: (id: string) =>
    api.delete(`/api/admin/bank/${id}`),
  togglePublish: (id: string) =>
    api.patch<ProblemBank>(`/api/admin/bank/${id}/publish`),

  // Topics
  getTopics: () =>
    api.get<TopicDto[]>('/api/admin/topics'),
  createTopic: (data: { name: string; colorHex?: string }) =>
    api.post<TopicDto>('/api/admin/topics', data),
  updateTopic: (id: string, data: { name: string; colorHex?: string }) =>
    api.put<TopicDto>(`/api/admin/topics/${id}`, data),
  deleteTopic: (id: string) =>
    api.delete(`/api/admin/topics/${id}`),

  // Users & Analytics
  getUsers: (params?: Record<string, string | number>) =>
    api.get<Page<UserSummary>>('/api/admin/users', { params }),
  getAnalytics: () =>
    api.get<AdminAnalytics>('/api/admin/analytics'),

  // Reports
  getReports: (params?: Record<string, string | number>) =>
    api.get<Page<ReportDto>>('/api/admin/reports', { params }),
  updateReport: (id: string, status: string) =>
    api.put(`/api/admin/reports/${id}`, { status }),
};
