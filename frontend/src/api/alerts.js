import axiosInstance from './axios';

export const getAlerts = (userId) => axiosInstance.get(`/api/alerts/${userId}`);
export const markAlertRead = (alertId) => axiosInstance.put(`/api/alerts/${alertId}/read`);
export const markAllAlertsRead = (userId) => axiosInstance.put(`/api/alerts/mark-all-read/${userId}`);
