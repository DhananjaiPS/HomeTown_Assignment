import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/me');
      return data;
    }
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/admin');
      return data;
    }
  });
};
