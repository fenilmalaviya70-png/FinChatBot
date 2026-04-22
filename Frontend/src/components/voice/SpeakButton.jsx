/**
 * Speak Button Component
 * Text-to-Speech functionality for AI messages
 * Reads entire answer in English regardless of input language
 */

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

const SpeakButton = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    // Cleanup on unmount
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!isSupported) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // If already speaking, stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure speech settings for English
    utterance.lang = 'en-US'; // Force English language
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 sm:p-2 rounded-lg relative transition-colors ${isSpeaking
        ? 'bg-primary-100 dark:bg-primary-900/30'
        : 'hover:bg-gray-100 dark:hover:bg-dark-700'
        }`}
      aria-label={isSpeaking ? 'Stop speaking' : 'Hear answer'}
      title={isSpeaking ? 'Stop speaking' : 'Hear answer in English'}
    >
      {isSpeaking ? (
        <div>
          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
        </div>
      ) : (
        <div>
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400" />
        </div>
      )}
    </button>
  );
};

export default SpeakButton;
