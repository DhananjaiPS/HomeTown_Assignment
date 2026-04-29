import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatbotWindow from './ChatbotWindow';
import { useLocation } from 'react-router-dom';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Extract context from URL if possible
  let context = {};
  if (location.pathname.includes('/articles/')) {
    const parts = location.pathname.split('/');
    if (parts.length >= 3) {
      context.articleId = parts[2];
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        title="Ask AI Assistant"
      >
        <MessageCircle size={24} />
      </button>

      <ChatbotWindow 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        context={context} 
      />
    </>
  );
};

export default ChatbotButton;
