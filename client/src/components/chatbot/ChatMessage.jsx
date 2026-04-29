import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, AlertTriangle, Lightbulb } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm break-words">
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2 flex-shrink-0">
          <User size={16} className="text-blue-600" />
        </div>
      </div>
    );
  }

  // AI Message
  return (
    <div className="flex justify-start mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${message.isError ? 'bg-red-100' : message.mode === 'hint' ? 'bg-amber-100' : 'bg-green-100'}`}>
        {message.isError ? <AlertTriangle size={16} className="text-red-600" /> :
          message.mode === 'hint' ? <Lightbulb size={16} className="text-amber-600" /> :
            <Bot size={16} className="text-green-600" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border ${message.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-gray-100 text-gray-800'}`}>
        <div className="prose prose-sm max-w-none break-words overflow-hidden">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <div className="my-2 p-3 bg-gray-900 rounded-lg overflow-x-auto max-w-full">
                  <pre className="text-gray-100 text-[11px] leading-relaxed" {...props} />
                </div>
              ),
              code: ({ node, inline, ...props }) => (
                inline 
                  ? <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600 font-mono" {...props} />
                  : <code {...props} />
              )
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

        {/* Metadata footer */}
        {message.source && !message.isError && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider">
              {message.source.replace('_', ' ')}
            </span>
            {message.usedRAG && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">
                RAG Enabled
              </span>
            )}
            {message.mode !== 'normal' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 uppercase tracking-wider">
                {message.mode} mode
              </span>
            )}
            {message.stats && (
              <span className="text-[10px] font-medium text-gray-400 ml-auto">
                {message.stats.aiTokensUsed} tokens
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
