import api from './axios';

export interface UploadResponse {
  url: string;
  publicId: string;
  fileType?: 'image' | 'pdf';
}

export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResponse>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Upload image or PDF file */
  file: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResponse>('/api/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
