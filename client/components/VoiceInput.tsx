'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceInteraction } from '@/hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onVoiceResponse?: (response: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onVoiceResult, onVoiceResponse, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { response, loading, processInput, getGreeting } = useVoiceInteraction();

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript) {
            onVoiceResult(finalTranscript);
            handleVoiceInput(finalTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onVoiceResult]);

  const handleVoiceInput = async (text: string) => {
    try {
      const result = await processInput(text);
      if (result && onVoiceResponse) {
        onVoiceResponse(result.response);
        
        // If should generate, trigger generation
        if (result.should_generate && result.topic) {
          onVoiceResult(result.topic);
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleGreeting = async () => {
    try {
      const greeting = await getGreeting();
      if (greeting && onVoiceResponse) {
        onVoiceResponse(greeting.message);
      }
    } catch (error) {
      console.error('Greeting error:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <Volume2 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Voice input not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || loading}
          variant={isListening ? "destructive" : "outline"}
          className="flex-1"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>
        
        <Button
          onClick={handleGreeting}
          disabled={disabled || loading}
          variant="ghost"
          size="icon"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {transcript && (
        <div className="p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <span className="text-blue-400">Transcript:</span> {transcript}
          </p>
        </div>
      )}

      {isListening && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-blue-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Listening...
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceInput;