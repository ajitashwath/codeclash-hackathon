import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Paperclip } from 'lucide-react';
import AIProviderSelector, { AIProvider } from '@/components/AIProviderSelector';
import AttachmentUpload, { AttachmentFile } from '@/components/AttachmentUpload';
import VoiceInput from '@/components/VoiceInput';

interface PromptInputProps {
  onGenerate: (prompt: string, provider: AIProvider, attachments: AttachmentFile[]) => Promise<void>;
  isGenerating: boolean;
}

export default function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    try {
      await onGenerate(prompt.trim(), selectedProvider, attachments);
      setPrompt(''); // Clear the prompt after successful generation
      setAttachments([]); // Clear attachments
      setShowAttachments(false);
    } catch (error) {
      console.error('Error generating presentation:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleVoiceResult = (text: string) => {
    setPrompt(text);
  };

  const handleVoiceResponse = (response: string) => {
    setVoiceResponse(response);
  };

  return (
    <div className="space-y-4">
      {/* AI Provider Selection */}
      <AIProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        disabled={isGenerating}
      />

      {/* Voice Response Display */}
      {voiceResponse && (
        <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-200">{voiceResponse}</p>
        </div>
      )}

      {/* Voice Input */}
      <VoiceInput
        onVoiceResult={handleVoiceResult}
        onVoiceResponse={handleVoiceResponse}
        disabled={isGenerating}
      />

      {/* Prompt Input */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Describe your presentation
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Business presentation with sales statistics data..."
          className="bg-gray-700/50 border-gray-600 focus:border-purple-500 resize-none h-20 text-sm"
          disabled={isGenerating}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Ctrl+Enter to generate quickly
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className="text-gray-400 hover:text-white"
          >
            <Paperclip className="w-4 h-4 mr-1" />
            Attachments ({attachments.length})
          </Button>
        </div>
      </div>

      {/* Attachments */}
      {showAttachments && (
        <AttachmentUpload
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          disabled={isGenerating}
        />
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Wand2 className="w-4 h-4 mr-2 animate-spin" />
            Generating with {selectedProvider.toUpperCase()}...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Slides with {selectedProvider.toUpperCase()}
          </>
        )}
      </Button>

      {/* Generation Status */}
      {isGenerating && (
        <div className="space-y-3">
          <div className="h-40 bg-gray-700/30 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <Wand2 className="w-8 h-8 mx-auto mb-2 animate-spin text-purple-500" />
              <p className="text-sm text-gray-400">Creating your presentation with {selectedProvider.toUpperCase()}...</p>
              <p className="text-xs text-gray-500 mt-1">
                {attachments.length > 0 && `Processing ${attachments.length} attachment(s)...`}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPrompt("Business presentation with sales statistics and growth metrics")}
          disabled={isGenerating}
          className="text-xs"
        >
          📊 Business Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPrompt("Marketing strategy presentation with campaign analysis")}
          disabled={isGenerating}
          className="text-xs"
        >
          📈 Marketing Strategy
        </Button>
      </div>
    </div>
  );
}