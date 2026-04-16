import axiosInstance from './axios';

export const registerUser = (data) => axiosInstance.post('/api/auth/register', data);
export const loginUser = (data) => axiosInstance.post('/api/auth/login', data);
export const getUserProfile = () => axiosInstance.get('/api/user/profile');
