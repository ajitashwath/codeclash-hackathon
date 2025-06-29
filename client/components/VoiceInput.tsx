'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onVoiceResponse?: (response: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onVoiceResult, onVoiceResponse, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(false); // Simplified for now

  if (!isSupported) {
    return (
      <div className="text-center p-2 bg-gray-800 rounded">
        <Volume2 className="w-6 h-6 text-gray-500 mx-auto mb-1" />
        <p className="text-xs text-gray-400">Voice input not supported</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          onClick={() => setIsListening(!isListening)}
          disabled={disabled}
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          className="flex-1 h-8"
        >
          {isListening ? (
            <>
              <MicOff className="w-3 h-3 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 mr-1" />
              Voice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default VoiceInput;