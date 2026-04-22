/**
 * Typing Effect Hook
 * Creates a typing animation effect for text
 */

import { useState, useEffect } from 'react';

export const useTypingEffect = (text, speed = 30, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isTyping };
};
