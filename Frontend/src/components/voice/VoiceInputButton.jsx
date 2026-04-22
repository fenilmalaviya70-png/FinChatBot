/**
 * Voice Input Button Component
 * Records audio and converts to text using Web Speech API
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceInputButton = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled}
      className={`relative flex-shrink-0 p-2 sm:p-3 rounded-lg ${isRecording
        ? 'bg-red-500 text-white shadow-lg'
        : 'text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      title={isRecording ? 'Click to stop recording' : 'Click to start voice input'}
    >
      {isRecording ? (
        <div>
          <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      ) : (
        <div>
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}

    </button>
  );
};

export default VoiceInputButton;
