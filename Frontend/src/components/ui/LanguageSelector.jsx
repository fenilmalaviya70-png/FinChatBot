/**
 * Language Selector Component
 * Allows users to select input language (English, Hindi, Gujarati)
 * Note: AI will always respond in English, but users can type in any language
 */

import { useState } from 'react';
import { Languages, Check } from 'lucide-react';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const handleSelect = (langCode) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Language Button - Mobile First */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm text-xs sm:text-sm"
        aria-label="Select input language"
        title="Select input language"
      >
        <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.flag} <span className="hidden xs:inline">{currentLanguage.nativeName}</span>
        </span>
      </button>

      {/* Dropdown Menu - Mobile Optimized */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          {/* Menu - Mobile First */}
          <div
            className="absolute bottom-full mb-3 sm:mb-4 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-64 sm:w-56 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Input Language
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                AI responds in English
              </p>
            </div>

            {/* Language Options */}
            <div className="py-1 sm:py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleSelect(language.code)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between ${selectedLanguage === language.code
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{language.flag}</span>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {language.nativeName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language.name}
                      </p>
                    </div>
                  </div>
                  {selectedLanguage === language.code && (
                    <div>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer Note */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                💡 Type in any language, AI understands all
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
