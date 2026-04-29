import { useState, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const useAIChat = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (messageText, context = {}) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/ai/chat', {
        message: messageText,
        articleId: context.articleId || undefined,
        assignmentId: context.assignmentId || undefined,
        mode: context.mode || 'normal'
      });

      const { answer, source, usedRAG, mode } = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        source,
        usedRAG,
        mode,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update local user stats instantly if returned
      if (response.data.stats && user) {
        const updatedUser = { ...user, stats: response.data.stats };
        setUser(updatedUser);
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      } else {
        // Fallback: Refresh user stats in background
        refreshUser();
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I am having trouble connecting right now. Please try again later.',
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser, refreshUser]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};
