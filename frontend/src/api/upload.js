import axiosInstance from './axios';

export const uploadImage = (formData) =>
  axiosInstance.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getHistory = (userId) => axiosInstance.get(`/api/history/${userId}`);
export const getHistoryItem = (id) => axiosInstance.get(`/api/history/item/${id}`);
