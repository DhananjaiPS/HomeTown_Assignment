import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { useEffect } from 'react';
import { useSocket } from './useSocket';

export const useLeaderboard = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ['leaderboard', page],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/leaderboard?page=${page}&limit=${limit}`);
      return data;
    }
  });

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      // Invalidate cache to refetch on socket event
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    };

    socket.on('leaderboard:update', handleUpdate);

    return () => {
      socket.off('leaderboard:update', handleUpdate);
    };
  }, [socket, queryClient]);

  return query;
};
