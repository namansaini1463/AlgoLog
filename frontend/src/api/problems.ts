import api from './axios';
import type { Page, ProblemBank } from './bank';

export interface UserProblem {
  id: string;
  bankProblemId: string | null;
  problem: ProblemBank | null;
  customTitle: string | null;
  customUrl: string | null;
  customTopic: string | null;
  customDifficulty: string | null;
  customTags: string[] | null;
  confidence: number;
  oneLiner: string;
  detailedNotes: string;
  timeTakenMins: number;
  hintsUsed: boolean;
  solvedAt: string;
  updatedAt: string;
  isFlagged: boolean;
  flaggedNote: string | null;
}

export interface LogProblemData {
  bankProblemId?: string;
  customTitle?: string;
  customUrl?: string;
  customTopic?: string;
  customDifficulty?: string;
  customTags?: string[];
  confidence: number;
  oneLiner?: string;
  detailedNotes?: string;
  timeTakenMins?: number;
  hintsUsed?: boolean;
}

export const problemsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Page<UserProblem>>('/api/problems', { params }),

  log: (data: LogProblemData) =>
    api.post<UserProblem>('/api/problems', data),

  update: (id: string, data: Partial<LogProblemData>) =>
    api.put<UserProblem>(`/api/problems/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/problems/${id}`),
};
