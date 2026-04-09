import api from './axios';

export interface ProblemBank {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  tags: string[];
  platform: string;
  platformUrl: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const bankApi = {
  browse: (params?: Record<string, string | number>) =>
    api.get<Page<ProblemBank>>('/api/bank', { params }),
  
  getTags: () =>
    api.get<string[]>('/api/bank/tags'),
};
