'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ColorThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  slideId?: number;
  presentationId?: string;
}

const DEFAULT_THEMES = {
  blue: { background: '#dbeafe', primary: '#2563eb', secondary: '#93c5fd', text: '#1e3a8a', accent: '#3b82f6' },
  red: { background: '#fee2e2', primary: '#dc2626', secondary: '#fca5a5', text: '#7f1d1d', accent: '#ef4444' },
  green: { background: '#dcfce7', primary: '#16a34a', secondary: '#86efac', text: '#14532d', accent: '#22c55e' },
  purple: { background: '#f3e8ff', primary: '#9333ea', secondary: '#c4b5fd', text: '#581c87', accent: '#a855f7' },
  yellow: { background: '#fef3c7', primary: '#d97706', secondary: '#fcd34d', text: '#92400e', accent: '#f59e0b' },
  pink: { background: '#fce7f3', primary: '#db2777', secondary: '#f9a8d4', text: '#831843', accent: '#ec4899' },
  cyan: { background: '#cffafe', primary: '#0891b2', secondary: '#67e8f9', text: '#164e63', accent: '#06b6d4' },
  lime: { background: '#ecfccb', primary: '#65a30d', secondary: '#bef264', text: '#365314', accent: '#84cc16' }
};

export function ColorThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  slideId, 
  presentationId 
}: ColorThemeSelectorProps) {
  const availableColors = Object.keys(DEFAULT_THEMES);

  const handleThemeChange = async (theme: string) => {
    try {
      onThemeChange(theme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-white">Color Theme</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {availableColors.map((color) => {
          const theme = DEFAULT_THEMES[color as keyof typeof DEFAULT_THEMES];
          if (!theme) return null;

          return (
            <Button
              key={color}
              onClick={() => handleThemeChange(color)}
              variant={currentTheme === color ? "default" : "outline"}
              className={`h-10 p-1 ${
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
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
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