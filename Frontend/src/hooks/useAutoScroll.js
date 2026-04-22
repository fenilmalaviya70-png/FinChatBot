/**
 * Auto Scroll Hook
 * Automatically scrolls to bottom when new messages arrive
 */

import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependencies = []) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, dependencies);

  return scrollRef;
};
