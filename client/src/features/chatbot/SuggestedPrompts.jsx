import React from 'react';
import { Sparkles } from 'lucide-react';

const SuggestedPrompts = ({ onSelectPrompt }) => {
  const prompts = [
    "Explain this topic simply",
    "Give me a real-life example",
    "Generate 3 practice questions",
    "Summarize the key points",
    "Ask me a viva question"
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(prompt)}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <Sparkles size={12} className="text-blue-500" />
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
