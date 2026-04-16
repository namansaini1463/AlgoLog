import api from './axios';

export interface UserCategory {
  id: string;
  name: string;
  colorHex: string;
  sortOrder: number;
}

export interface UserCategoryRequest {
  name: string;
  colorHex?: string;
  sortOrder?: number;
}

export const categoriesApi = {
  list: () => api.get<UserCategory[]>('/api/categories'),

  create: (data: UserCategoryRequest) =>
    api.post<UserCategory>('/api/categories', data),

  update: (id: string, data: UserCategoryRequest) =>
    api.put<UserCategory>(`/api/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/categories/${id}`),

  reorder: (orderedIds: string[]) =>
    api.put('/api/categories/reorder', { orderedIds }),
};
