import api from './axios';
import type { UserProblem } from './problems';
import type { Page } from './bank';

export interface Revision {
  id: string;
  userProblemId: string;
  userProblem: UserProblem;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  lastReviewedAt: string;
  nextDueAt: string;
}

export interface RevisionItem {
  userProblemId: string;
  revisionId: string;
  problemTitle: string;
  category: string;
  difficulty: string;
  topic: string;
  tags: string[];
  platform: string;
  platformUrl: string;
  oneLiner: string;
  detailedNotes: string;
  nextDueAt: string;
  lastReviewedAt: string;
  daysOverdue: number;
  timesRevised: number;
  lastConfidence: number | null;
  streakCount: number;
  intervalDays: number;
  isFlagged: boolean;
  flaggedNote: string | null;
  isSnoozed: boolean;
  revisionState: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'FLAGGED';
}

export interface RevisionStats {
  flaggedCount: number;
  overdueCount: number;
  dueTodayCount: number;
  thisWeekCount: number;
  totalScheduled: number;
}

export interface RevisionQueue {
  flagged: RevisionItem[];
  overdue: RevisionItem[];
  dueToday: RevisionItem[];
  upcoming7Days: RevisionItem[];
  stats: RevisionStats;
}

export const revisionsApi = {
  due: () =>
    api.get<Revision[]>('/api/revisions/due'),

  queue: () =>
    api.get<RevisionQueue>('/api/revisions/queue'),

  scheduled: (params?: Record<string, string | number>) =>
    api.get<Page<RevisionItem>>('/api/revisions/scheduled', { params }),

  stats: () =>
    api.get<RevisionStats>('/api/revisions/stats'),

  complete: (id: string, confidence: number) =>
    api.post<Revision>(`/api/revisions/${id}/complete`, { confidence }),

  snooze: (id: string, days: number = 1) =>
    api.patch<Revision>(`/api/revisions/${id}/snooze`, { days }),

  flag: (userProblemId: string, isFlagged: boolean, flaggedNote?: string) =>
    api.patch<Revision>(`/api/problems/${userProblemId}/flag`, { isFlagged, flaggedNote }),
};
