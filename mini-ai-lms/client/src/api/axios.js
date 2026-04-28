import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If 401 Unauthorized, we might want to trigger a logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      // Can't use useNavigate here directly, handled in AuthContext or components
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
