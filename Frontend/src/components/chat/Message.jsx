/**
 * Message Component
 * Displays a single chat message with voice and visualization
 */

import { User, Bot, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SpeakerButton } from './VoiceInput';
import DataVisualization from './DataVisualization';

const Message = ({ message }) => {
  const { role, content } = message;

  // Different styles for different message types
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const isSystem = role === 'system';

  return (
    <div className={`flex gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 animate-fadeIn ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (left side for assistant/system) */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${isAssistant
              ? 'bg-gradient-to-br from-blue-600 to-blue-700'
              : 'bg-gradient-to-br from-blue-100 to-blue-200'
              }`}
          >
            {isAssistant ? (
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Info className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
            )}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[65%]">
        <div
          className={`${isUser
            ? 'message-user px-6 py-4'
            : isAssistant
              ? 'message-assistant px-6 py-4'
              : 'message-system px-5 py-3'
            }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {isAssistant ? (
                // Render markdown for assistant messages
                <div className="prose prose-gray prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="mb-3 ml-4 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="mb-3 ml-4 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props} />
                        ) : (
                          <code className="block p-3 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                        ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                // Plain text for user and system messages
                <p className={`leading-relaxed ${isSystem ? 'text-sm' : 'text-base'}`}>{content}</p>
              )}
            </div>

            {/* Voice button for assistant messages */}
            {isAssistant && (
              <SpeakerButton text={content} />
            )}
          </div>
        </div>

        {/* Data Visualization for assistant messages */}
        {isAssistant && <DataVisualization content={content} />}
      </div>

      {/* Avatar (right side for user) */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
