import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Maximize2, Minimize2, Loader2, Bot } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';
import ModeSelector from './ModeSelector';

const ChatbotWindow = ({ isOpen, onClose, context = {} }) => {
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState('normal');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue, { ...context, mode });
    setInputValue('');
  };

  const handlePromptSelect = (prompt) => {
    sendMessage(prompt, { ...context, mode });
  };

  return (
    <div className={`fixed z-50 flex flex-col bg-white border border-gray-200 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'inset-4 md:inset-10 rounded-2xl' 
        : 'bottom-20 right-4 w-[380px] h-[600px] max-h-[calc(100vh-100px)] rounded-2xl'
    }`}>
      {/* Header */}
      <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-white" />
          <div>
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <p className="text-blue-100 text-[10px] uppercase font-semibold">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => clearChat()} className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors">
            <span className="text-xs font-medium">Clear</span>
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors">
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <ModeSelector currentMode={mode} setMode={setMode} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <Bot size={48} className="text-blue-600 mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">How can I help?</h4>
            <p className="text-sm text-gray-500 mb-6">
              I can explain concepts, give hints, or summarize articles.
            </p>
            <SuggestedPrompts onSelectPrompt={handlePromptSelect} />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm p-4">
                <Loader2 size={16} className="animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask me anything...`}
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};

export default ChatbotWindow;
