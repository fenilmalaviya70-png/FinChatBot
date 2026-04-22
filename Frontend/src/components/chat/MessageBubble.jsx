/**
 * Message Bubble Component
 * Animated message bubbles with different styles for user and AI
 */

import React, { memo } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MessageActions from './MessageActions';

const MessageBubble = memo(({ message, isUser, index, onFeedback }) => {
  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser
          ? 'bg-gradient-to-br from-primary-500 to-purple-600'
          : 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800'
          } shadow-lg`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[75%] sm:max-w-[65%] ${isUser ? 'items-end' : 'items-start'
          }`}
      >
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-md ${isUser
            ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-dark-700'
            }`}
        >
          {/* Content */}
          <div className={`prose prose-sm max-w-none ${isUser
            ? 'prose-invert'
            : 'dark:prose-invert'
            }`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* AI Badge */}
          {!isUser && (
            <div
              className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg"
            >
              <Sparkles className="w-3 h-3" />
              AI
            </div>
          )}
        </div>

        {/* Message Actions (Copy, Like, Dislike) - Only for AI messages */}
        {!isUser && (
          <MessageActions message={message} onFeedback={onFeedback} />
        )}

        {/* Timestamp */}
        <p
          className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'
            }`}
        >
          {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
