/**
 * FeatureModeBar Component
 * Mode selector: General | Document Analysis | Smart Chart | Insights
 */

import React from 'react';
import { MessageCircle, FileSearch, BarChart3, Lightbulb } from 'lucide-react';

const MODES = [
    {
        id: 'General',
        label: 'General',
        icon: MessageCircle,
        description: 'General financial Q&A',
        color: 'from-blue-500 to-blue-600',
        bgActive: 'bg-blue-50 dark:bg-blue-900/30',
        borderActive: 'border-blue-300 dark:border-blue-700',
        textActive: 'text-blue-700 dark:text-blue-300',
    },
    {
        id: 'Document_Analysis',
        label: 'Doc Analysis',
        icon: FileSearch,
        description: 'Deep document analysis',
        color: 'from-purple-500 to-purple-600',
        bgActive: 'bg-purple-50 dark:bg-purple-900/30',
        borderActive: 'border-purple-300 dark:border-purple-700',
        textActive: 'text-purple-700 dark:text-purple-300',
    },
    {
        id: 'Smart_Chart',
        label: 'Smart Chart',
        icon: BarChart3,
        description: 'Auto-generate charts',
        color: 'from-green-500 to-green-600',
        bgActive: 'bg-green-50 dark:bg-green-900/30',
        borderActive: 'border-green-300 dark:border-green-700',
        textActive: 'text-green-700 dark:text-green-300',
    },
    {
        id: 'Insights',
        label: 'Insights',
        icon: Lightbulb,
        description: 'Key insights & summary',
        color: 'from-amber-500 to-amber-600',
        bgActive: 'bg-amber-50 dark:bg-amber-900/30',
        borderActive: 'border-amber-300 dark:border-amber-700',
        textActive: 'text-amber-700 dark:text-amber-300',
    },
];

const FeatureModeBar = ({ activeMode, onModeChange }) => {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/80 dark:bg-dark-900/80 backdrop-blur border-b border-gray-200/60 dark:border-dark-700/60 overflow-x-auto scrollbar-none">
            {MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;

                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        title={mode.description}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              border whitespace-nowrap transition-all duration-200
              ${isActive
                                ? `${mode.bgActive} ${mode.borderActive} ${mode.textActive} shadow-sm`
                                : 'bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                            }`}
                    >
                        {isActive && (
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${mode.color}`} />
                        )}
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default FeatureModeBar;
