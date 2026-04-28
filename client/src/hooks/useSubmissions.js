import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

export const useAssignment = (articleId) => {
  return useQuery({
    queryKey: ['assignment', 'article', articleId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/assignments/article/${articleId}`);
      return data;
    },
    enabled: !!articleId,
    retry: false
  });
};

export const useSubmissions = (assignmentId) => {
  return useQuery({
    queryKey: ['submissions', 'me', assignmentId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/submissions/me?assignmentId=${assignmentId}`);
      return data;
    },
    enabled: !!assignmentId
  });
};

export const useMySubmissions = () => {
  return useQuery({
    queryKey: ['submissions', 'me', 'all'],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/submissions/me`);
      return data;
    }
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post(`/submissions`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // leaderboard query is invalidated by socket, but we can do it here too just in case
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });
};

export const useAiHint = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, questionId, questionText }) => {
      const { data } = await axiosInstance.post(`/ai/hint`, { assignmentId, questionId, questionText });
      return data;
    }
  });
};
