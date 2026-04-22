/**
 * Settings Menu Component
 * Dropdown menu for app settings
 */

import { useState } from 'react';
import { Settings, MousePointer2, Zap, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const SettingsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { customCursor, toggleCustomCursor, reducedMotion, toggleReducedMotion } = useSettings();

  const settings = [
    {
      id: 'cursor',
      icon: MousePointer2,
      label: 'Custom Cursor',
      description: 'Premium animated cursor',
      enabled: customCursor,
      toggle: toggleCustomCursor,
      desktop: true
    },
    {
      id: 'motion',
      icon: Zap,
      label: 'Reduced Motion',
      description: 'Minimize animations',
      enabled: reducedMotion,
      toggle: toggleReducedMotion,
      desktop: false
    }
  ];

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          {/* Menu */}
          <div
            className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Settings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Customize your experience
              </p>
            </div>

            {/* Settings List */}
            <div className="py-2">
              {settings.map((setting) => {
                // Hide desktop-only settings on mobile
                if (setting.desktop && window.innerWidth < 1024) {
                  return null;
                }

                return (
                  <button
                    key={setting.id}
                    onClick={() => {
                      setting.toggle();
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${setting.enabled
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                        }`}>
                        <setting.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {setting.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {setting.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${setting.enabled
                      ? 'bg-primary-500'
                      : 'bg-gray-300 dark:bg-dark-600'
                      }`}>
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${setting.enabled ? 'left-[22px]' : 'left-[2px]'
                          }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                💡 Settings are saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsMenu;
