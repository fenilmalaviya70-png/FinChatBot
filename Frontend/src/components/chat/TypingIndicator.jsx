/**
 * Typing Indicator Component
 * Simple animated typing indicator for AI responses
 */

import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center shadow-lg relative"
      >
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Typing Bubble */}
      <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-md">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-600"
              style={{
                animation: 'typing-bounce 1.2s ease-in-out infinite',
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
