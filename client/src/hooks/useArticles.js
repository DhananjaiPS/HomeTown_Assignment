import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';

export const useArticles = (page = 1, search = '', tag = '', difficulty = '') => {
  return useQuery({
    queryKey: ['articles', page, search, tag, difficulty],
    queryFn: async () => {
      let url = `/articles?page=${page}`;
      if (search) url += `&search=${search}`;
      if (tag) url += `&tag=${tag}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      const { data } = await axiosInstance.get(url);
      return data;
    }
  });
};

export const useArticle = (slug) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/articles/${slug}`);
      return data;
    },
    enabled: !!slug
  });
};

export const useArticleProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosInstance.post(`/articles/${id}/progress`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['article'] });
    }
  });
};

export const useAiSummary = () => {
  return useMutation({
    mutationFn: async (articleId) => {
      const { data } = await axiosInstance.get(`/articles/${articleId}/ai-summary`);
      return data;
    }
  });
};
