/**
 * Navbar Component
 * Top navigation bar with logo, theme toggle, and profile
 */

import React from 'react';
import { Menu, Sparkles, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import SettingsMenu from '../ui/SettingsMenu';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-700"
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            {/* Menu button - show on all sizes when on chat page */}
            {!isAboutPage && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                  FinChat AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Financial Analyst
                </p>
              </div>
            </div>
          </div>

          {/* Right: About + Settings + Theme Toggle + Profile */}
          <div className="flex items-center gap-3">
            {/* About Button */}
            <button
              onClick={() => navigate(isAboutPage ? '/' : '/about')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            >
              <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isAboutPage ? 'Chat' : 'About'}
              </span>
            </button>

            {/* Mobile About Button */}
            <button
              onClick={() => navigate(isAboutPage ? '/' : '/about')}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="About"
            >
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <SettingsMenu />
            <ThemeToggle />

            {/* Profile */}
            <div
              className="relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-0.5 cursor-pointer">
                <div className="w-full h-full rounded-full bg-white dark:bg-dark-800 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    AI
                  </span>
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-light rounded-full border-2 border-white dark:border-dark-900" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
