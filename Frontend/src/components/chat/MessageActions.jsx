/**
 * Message Actions Component
 * Copy, Like, Dislike, and Speak actions for messages
 */

import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import SpeakButton from '../voice/SpeakButton';

const MessageActions = ({ message, onFeedback }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(message.feedback || null); // 'like' or 'dislike'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLike = () => {
    const newFeedback = feedback === 'like' ? null : 'like';
    setFeedback(newFeedback);
    onFeedback?.(message.id, newFeedback);
  };

  const handleDislike = () => {
    const newFeedback = feedback === 'dislike' ? null : 'dislike';
    setFeedback(newFeedback);
    onFeedback?.(message.id, newFeedback);
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 mt-2 flex-wrap">
      {/* Speak Button (Hear Answer) */}
      <SpeakButton text={message.content} />

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 group relative transition-colors"
        aria-label="Copy message"
        title="Copy to clipboard"
      >
        {copied ? (
          <div>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
          </div>
        ) : (
          <div>
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400" />
          </div>
        )}

        {/* Tooltip */}
        {copied && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap z-10">
            Copied!
          </div>
        )}
      </button>

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${feedback === 'like'
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'hover:bg-gray-100 dark:hover:bg-dark-700'
          }`}
        aria-label="Like message"
        title="Helpful response"
      >
        <div>
          <ThumbsUp
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${feedback === 'like'
              ? 'text-green-600 dark:text-green-400 fill-current'
              : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400'
              }`}
          />
        </div>
      </button>

      {/* Dislike Button */}
      <button
        onClick={handleDislike}
        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${feedback === 'dislike'
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'hover:bg-gray-100 dark:hover:bg-dark-700'
          }`}
        aria-label="Dislike message"
        title="Not helpful"
      >
        <div>
          <ThumbsDown
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${feedback === 'dislike'
              ? 'text-red-600 dark:text-red-400 fill-current'
              : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
          />
        </div>
      </button>

      {/* Feedback confirmation - Hidden on mobile */}
      {feedback && (
        <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 ml-2">
          {feedback === 'like' ? 'Thanks for your feedback!' : 'We\'ll improve!'}
        </span>
      )}
    </div>
  );
};

export default MessageActions;
