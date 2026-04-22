/**
 * SuggestionChips Component
 * Displays smart follow-up question suggestions after each AI response
 */

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const SuggestionChips = ({ suggestions = [], onSelect }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Sparkles className="w-3 h-3" />
                <span>Suggested follow-ups</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(suggestion)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 text-xs
              bg-white/70 dark:bg-dark-800/70
              hover:bg-primary-50 dark:hover:bg-primary-900/30
              border border-gray-200 dark:border-dark-600
              hover:border-primary-300 dark:hover:border-primary-700
              text-gray-700 dark:text-gray-300
              hover:text-primary-700 dark:hover:text-primary-300
              rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <span>{suggestion}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestionChips;
