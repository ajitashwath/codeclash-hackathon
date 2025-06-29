'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { useColorThemes } from '@/hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

interface ColorThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  slideId?: number;
  presentationId?: string;
}

export function ColorThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  slideId, 
  presentationId 
}: ColorThemeSelectorProps) {
  const { themes, availableColors, loading, error, getThemes, changeSlideColor } = useColorThemes();

  useEffect(() => {
    getThemes();
  }, [getThemes]);

  const handleThemeChange = async (theme: string) => {
    try {
      if (slideId) {
        await changeSlideColor(slideId, theme, presentationId);
      }
      onThemeChange(theme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" text="Loading themes..." />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        Failed to load themes: {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-white">Color Theme</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {availableColors.map((color) => {
          const theme = themes[color];
          if (!theme) return null;

          return (
            <Button
              key={color}
              onClick={() => handleThemeChange(color)}
              variant={currentTheme === color ? "default" : "outline"}
              className={`h-12 p-1 ${
                currentTheme === color 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:ring-1 hover:ring-gray-400'
              }`}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.primary,
              }}
            >
              <div className="w-full h-full rounded flex items-center justify-center">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
              </div>
            </Button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 capitalize">
        Current: {currentTheme}
      </p>
    </div>
  );
}

export default ColorThemeSelector;