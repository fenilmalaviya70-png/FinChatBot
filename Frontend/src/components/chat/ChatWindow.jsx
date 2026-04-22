/**
 * Chat Window Component
 * Main chat interface with messages, charts, suggestions, feature modes, and citations
 */

import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import ChartCard from '../charts/ChartCard';
import CitationPanel from '../panels/CitationPanel';
import ToolCallsPanel from '../panels/ToolCallsPanel';
import TypingIndicator from './TypingIndicator';
import VoiceInputButton from '../voice/VoiceInputButton';
import LanguageSelector from '../ui/LanguageSelector';
import FeatureModeBar from '../ui/FeatureModeBar';
import ExportReports from '../export/ExportReports';
import { useAutoScroll } from '../../hooks/useAutoScroll';

const ChatWindow = ({
  messages,
  input,
  setInput,
  onSendMessage,
  isLoading,
  onFileUpload,
  onMessageFeedback,
  conversationTitle,
  featureMode,
  onFeatureModeChange,
  documents = [],
}) => {
  const processingDocs = documents.filter(d => d.status === 'processing' || d.status === 'uploading');
  const scrollRef = useAutoScroll([messages, isLoading]);
  const inputRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) onSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const placeholders = {
    en: 'Ask about financial data...',
    hi: 'वित्तीय डेटा के बारे में पूछें...',
    gu: 'નાણાકીય ડેટા વિશે પૂછો...'
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">

      {/* Feature Mode Bar */}
      <FeatureModeBar
        activeMode={featureMode}
        onModeChange={onFeatureModeChange}
      />

      {/* Document Processing Banner */}
      {processingDocs.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>
            Processing {processingDocs.length === 1 ? `"${processingDocs[0].fileName}"` : `${processingDocs.length} documents`}... Please wait before asking questions about {processingDocs.length === 1 ? 'it' : 'them'}.
          </span>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to FinChat AI
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Your intelligent financial analyst. Upload documents and ask questions to get instant insights, charts, and analysis.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                'Give me a bar chart of revenue',
                'Show profit trend over 3 years',
                'What is the debt-to-equity ratio?',
                'Analyze and visualize profit margins'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 text-sm text-left bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message.id || index}>
                <MessageBubble
                  message={message}
                  isUser={message.role === 'user'}
                  index={index}
                  onFeedback={onMessageFeedback}
                />

                {/* AI Response Enhancements */}
                {message.role === 'assistant' && (
                  <>
                    {/* Chart */}
                    {message.chart_data && (
                      <ChartCard chartData={message.chart_data} />
                    )}

                    {/* Tool Calls */}
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <ToolCallsPanel toolCalls={message.tool_calls} />
                    )}

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <CitationPanel citations={message.citations} />
                    )}

                    {/* Suggestion Chips — only on last assistant message */}
                    {index === messages.length - 1 && message.suggestions && (
                      <SuggestionChips
                        suggestions={message.suggestions}
                        onSelect={handleSuggestionSelect}
                      />
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg p-3 sm:p-4 pt-4 sm:pt-5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Language Selector + Export */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between px-1">
            <ExportReports messages={messages} conversationTitle={conversationTitle} />
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>

          <div className="relative">
            <div className="relative flex items-end gap-1 sm:gap-2 bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-dark-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
              {/* File Upload */}
              <button
                type="button"
                onClick={onFileUpload}
                className="hidden xs:flex flex-shrink-0 p-2 sm:p-3 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Upload file"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholders[selectedLanguage]}
                disabled={isLoading}
                rows={1}
                className="flex-1 px-2 sm:px-2 py-2 sm:py-3 bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none disabled:opacity-50 max-h-24 sm:max-h-32"
                style={{ minHeight: '20px', maxHeight: '96px' }}
              />

              {/* Voice Input */}
              <div className="flex-shrink-0">
                <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 m-1 sm:m-2 p-2 sm:p-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 italic">
                {isLoading && 'AI is analyzing your request...'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                {input.length} characters
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
