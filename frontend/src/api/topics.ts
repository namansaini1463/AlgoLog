import api from './axios';

export interface TopicDto {
  id: string;
  name: string;
  colorHex: string;
  category: string;
}

export const topicsApi = {
  list: (params?: Record<string, string>) => api.get<TopicDto[]>('/api/topics', { params }),
};
