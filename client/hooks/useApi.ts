import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Slide, Presentation, AIResponse, VoiceResponse } from '@/types/slide';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Specific hooks for common operations
export function useSlideGeneration() {
  const { data, loading, error, execute } = useApi<{ slide: Slide; ai_response: AIResponse }>();

  const generateSlide = useCallback(
    (prompt: string, colorTheme?: string) => 
      execute(() => apiClient.generateSlide(prompt, colorTheme)),
    [execute]
  );

  return {
    slide: data?.slide || null,
    aiResponse: data?.ai_response || null,
    loading,
    error,
    generateSlide,
  };
}

export function usePresentationManagement() {
  const { data, loading, error, execute } = useApi<Presentation>();

  const createPresentation = useCallback(
    (prompt: string, slides?: Slide[], colorTheme?: string) =>
      execute(() => apiClient.createPresentation(prompt, slides, colorTheme)),
    [execute]
  );

  const updatePresentation = useCallback(
    (presentationId: string, slides: Slide[]) =>
      execute(() => apiClient.updatePresentation(presentationId, slides)),
    [execute]
  );

  const getPresentation = useCallback(
    (presentationId: string) =>
      execute(() => apiClient.getPresentation(presentationId)),
    [execute]
  );

  return {
    presentation: data,
    loading,
    error,
    createPresentation,
    updatePresentation,
    getPresentation,
  };
}

export function useVoiceInteraction() {
  const { data, loading, error, execute } = useApi<VoiceResponse>();

  const getGreeting = useCallback(
    () => execute(() => apiClient.getVoiceGreeting()),
    [execute]
  );

  const processInput = useCallback(
    (input: string) => execute(() => apiClient.processVoiceInput(input)),
    [execute]
  );

  return {
    response: data,
    loading,
    error,
    getGreeting,
    processInput,
  };
}

export function useColorThemes() {
  const { data, loading, error, execute } = useApi<{ themes: Record<string, any>; available_colors: string[] }>();

  const getThemes = useCallback(
    () => execute(() => apiClient.getColorThemes()),
    [execute]
  );

  const changeSlideColor = useCallback(
    (slideId: number, colorTheme: string, presentationId?: string) =>
      execute(() => apiClient.changeSlideColor(slideId, colorTheme, presentationId)),
    [execute]
  );

  return {
    themes: data?.themes || {},
    availableColors: data?.available_colors || [],
    loading,
    error,
    getThemes,
    changeSlideColor,
  };
}