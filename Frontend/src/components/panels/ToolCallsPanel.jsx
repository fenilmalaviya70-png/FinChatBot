/**
 * Tool Calls Panel Component
 * Displays calculation tools used by the AI agent
 */

import React, { useState, memo } from 'react';
import { Wrench, ChevronDown, CheckCircle, XCircle, Calculator } from 'lucide-react';

const ToolCallsPanel = memo(({ toolCalls }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div
      className="mt-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/30 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500 text-white">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              🔧 {toolCalls.length} Calculation{toolCalls.length > 1 ? 's' : ''} Performed
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI agent tool execution log
            </p>
          </div>
        </div>
        <div>
          <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Tool Calls List */}
      {isExpanded && (
        <div
          className="border-t border-green-200 dark:border-green-800/30"
        >
          <div className="p-4 space-y-3">
            {toolCalls.map((call, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Tool Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Calculator className="w-5 h-5" />
                  </div>

                  {/* Tool Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {call.tool}
                      </span>
                      {call.result?.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>

                    {/* Arguments */}
                    {call.args && Object.keys(call.args).length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Arguments:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(call.args).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-md font-mono"
                            >
                              {key}: {JSON.stringify(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {call.result && (
                      <div className={`p-2 rounded-lg ${call.result.success
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'
                        }`}>
                        {call.result.success ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Result:
                            </span>
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">
                              {call.result.result}
                              {call.result.unit && ` ${call.result.unit}`}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-red-700 dark:text-red-400">
                            Error: {call.result.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ToolCallsPanel.displayName = 'ToolCallsPanel';

export default ToolCallsPanel;
