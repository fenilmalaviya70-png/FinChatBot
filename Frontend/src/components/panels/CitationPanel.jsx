/**
 * Citation Panel Component
 * Displays source citations with expandable details
 */

import React, { useState, memo } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const CitationPanel = memo(({ citations }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div
      className="mt-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500 text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              📚 Sources ({citations.length})
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click to view references
            </p>
          </div>
        </div>
        <div>
          <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Citations List */}
      {isExpanded && (
        <div
          className="border-t border-blue-200 dark:border-blue-800/30"
        >
          <div className="p-4 space-y-3">
            {citations.map((citation, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Page Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {citation.page}
                  </div>

                  {/* Citation Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Page {citation.page}
                      </span>
                      {citation.confidence && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • {(citation.confidence * 100).toFixed(0)}% relevance
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {citation.snippet}
                    </p>
                  </div>

                  {/* External Link Icon */}
                  <button
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Confidence Bar */}
                {citation.confidence && (
                  <div className="mt-2 h-1 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${citation.confidence * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

CitationPanel.displayName = 'CitationPanel';

export default CitationPanel;
