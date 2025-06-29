'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onVoiceResponse?: (response: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onVoiceResult, onVoiceResponse, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceResult(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onVoiceResult]);

  const toggleListening = () => {
    if (!recognition || disabled) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-2 bg-gray-800/50 rounded border border-gray-700">
        <AlertCircle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
        <p className="text-xs text-gray-400">Voice input not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          onClick={toggleListening}
          disabled={disabled}
          variant="outline"
          size="sm"
          className={`flex-1 h-8 transition-all duration-200 border ${
            isListening 
              ? 'bg-red-600 border-red-500 text-white hover:bg-red-700 hover:border-red-600' 
              : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3 h-3 mr-1" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 mr-1" />
              Voice Input
            </>
          )}
        </Button>
      </div>
      
      {isListening && (
        <div className="text-center p-2 bg-blue-900/30 border border-blue-700 rounded">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-200">Listening...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceInput;