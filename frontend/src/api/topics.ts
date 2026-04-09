import api from './axios';

export interface TopicDto {
  id: string;
  name: string;
  colorHex: string;
}

export const topicsApi = {
  list: () => api.get<TopicDto[]>('/api/topics'),
};
