import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

export const useAdaptiveInsights = () => {
  return useQuery({
    queryKey: ['adaptive-insights'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/adaptive/insights');
        return data.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useAdaptiveRecommendations = () => {
  return useQuery({
    queryKey: ['adaptive-recommendations'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/adaptive/recommendations');
        return data.data || [];
      } catch {
        return [];
      }
    },
  });
};

export const useLearningDNA = () => {
  return useQuery({
    queryKey: ['learning-dna'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/adaptive/dna');
        return data.data || null;
      } catch {
        return null;
      }
    },
  });
};

