/**
 * Theme Toggle Component
 * Animated toggle between light and dark themes
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900"
      aria-label="Toggle theme"
    >
      {/* Toggle background */}
      <div
        className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-dark-900 shadow-md flex items-center justify-center transition-all ${isDark ? 'left-[32px]' : 'left-[2px]'
          }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-primary-500" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
