/**
 * Settings Context
 * Manages app settings like custom cursor, reduced motion, etc.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [customCursor, setCustomCursor] = useState(() => {
    const saved = localStorage.getItem('customCursor');
    return saved !== null ? JSON.parse(saved) : true; // Default: enabled
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('reducedMotion');
    return saved !== null ? JSON.parse(saved) : false; // Default: disabled
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('customCursor', JSON.stringify(customCursor));
    
    // Apply cursor style to body
    if (customCursor && window.innerWidth >= 1024) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [customCursor]);

  useEffect(() => {
    localStorage.setItem('reducedMotion', JSON.stringify(reducedMotion));
  }, [reducedMotion]);

  const toggleCustomCursor = () => {
    setCustomCursor(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const value = {
    customCursor,
    setCustomCursor,
    toggleCustomCursor,
    reducedMotion,
    setReducedMotion,
    toggleReducedMotion,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
