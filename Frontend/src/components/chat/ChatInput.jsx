/**
 * Chat Input Component
 * Input field for sending messages and uploading files with integrated voice input
 */

import { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { VoiceButton } from './VoiceInput';

const ChatInput = ({ input, setInput, onSend, isLoading, onFileUpload, onVoiceTranscript }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleFileUploadClick = () => {
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-white rounded-lg text-xs sm:text-sm shadow-sm border border-gray-200"
            >
              <span className="truncate max-w-[100px] sm:max-w-[150px] text-gray-700">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="hover:text-red-500 text-gray-500 flex-shrink-0 transition-colors"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={handleFileUploadClick}
            disabled={isLoading}
            className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
          {/* Voice Input Button - Left side */}
          {onVoiceTranscript && (
            <div className="flex-shrink-0">
              <VoiceButton
                onTranscript={onVoiceTranscript}
                disabled={isLoading}
              />
            </div>
          )}

          {/* File Upload Button */}
          <label className="flex-shrink-0 cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I want to analyse my document"
            disabled={isLoading}
            className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 disabled:opacity-50 text-sm sm:text-base"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </form>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center hidden sm:block">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
