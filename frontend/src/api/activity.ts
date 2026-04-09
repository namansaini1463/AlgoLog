import api from './axios';

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  totalRevised: number;
}

export const activityApi = {
  heatmap: () =>
    api.get<HeatmapEntry[]>('/api/activity/heatmap'),

  streak: () =>
    api.get<StreakData>('/api/activity/streak'),
};
