'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Zap, Brain } from 'lucide-react';

export type AIProvider = 'gemini' | 'gpt' | 'claude';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'bg-blue-500',
    description: 'Google\'s advanced AI model',
    features: ['Fast generation', 'Creative content', 'Multi-modal']
  },
  gpt: {
    name: 'OpenAI GPT',
    icon: Brain,
    color: 'bg-green-500',
    description: 'OpenAI\'s powerful language model',
    features: ['High quality', 'Detailed content', 'Professional tone']
  },
  claude: {
    name: 'Anthropic Claude',
    icon: Zap,
    color: 'bg-purple-500',
    description: 'Anthropic\'s helpful AI assistant',
    features: ['Thoughtful responses', 'Structured content', 'Safety focused']
  }
};

export function AIProviderSelector({ selectedProvider, onProviderChange, disabled }: AIProviderSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-white">AI Provider</span>
      </div>

      <Select value={selectedProvider} onValueChange={onProviderChange} disabled={disabled}>
        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              {React.createElement(AI_PROVIDERS[selectedProvider].icon, { className: "w-4 h-4" })}
              {AI_PROVIDERS[selectedProvider].name}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
            <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
              <div className="flex items-center gap-2">
                {React.createElement(provider.icon, { className: "w-4 h-4" })}
                <span>{provider.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-gray-400 hover:text-white"
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </Button>

      {showDetails && (
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            {React.createElement(AI_PROVIDERS[selectedProvider].icon, { 
              className: `w-5 h-5 text-white` 
            })}
            <h4 className="font-medium text-white">{AI_PROVIDERS[selectedProvider].name}</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">{AI_PROVIDERS[selectedProvider].description}</p>
          <div className="flex flex-wrap gap-1">
            {AI_PROVIDERS[selectedProvider].features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIProviderSelector;