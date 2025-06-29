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
    async (prompt: string, slides?: Slide[], colorTheme?: string) => {
      const response = await apiClient.createPresentation(prompt, slides, colorTheme);
      // Map API response to Presentation type
      return {
        id: response.presentation_id,
        prompt,
        slides: response.slides as Slide[],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Presentation;
    },
    []
  );

  const updatePresentation = useCallback(
    async (presentationId: string, slides: Slide[]) => {
      const response = await apiClient.updatePresentation(presentationId, slides);
      // Map API response to Presentation type
      const p = response.presentation;
      return {
        id: p.id || presentationId,
        prompt: p.prompt,
        slides: p.slides as Slide[],
        default_color_theme: p.default_color_theme,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      } as Presentation;
    },
    []
  );

  const getPresentation = useCallback(
    async (presentationId: string) => {
      const p = await apiClient.getPresentation(presentationId);
      return {
        id: p.id || presentationId,
        prompt: p.prompt,
        slides: p.slides as Slide[],
        default_color_theme: p.default_color_theme,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      } as Presentation;
    },
    []
  );

  return {
    presentation: data,
    loading,
    error,
    createPresentation: (prompt: string, slides?: Slide[], colorTheme?: string) => execute(() => createPresentation(prompt, slides, colorTheme)),
    updatePresentation: (presentationId: string, slides: Slide[]) => execute(() => updatePresentation(presentationId, slides)),
    getPresentation: (presentationId: string) => execute(() => getPresentation(presentationId)),
  };
}

export function useVoiceInteraction() {
  const { data, loading, error, execute } = useApi<VoiceResponse>();

  const getGreeting = useCallback(
    () => execute(async () => {
      const response = await apiClient.getVoiceGreeting();
      return {
        message: response.message || response.response || '',
        voice_enabled: response.voice_enabled ?? true,
        suggestions: response.suggestions || [],
      } as VoiceResponse;
    }),
    [execute]
  );

  const processInput = useCallback(
    (input: string) => execute(async () => {
      const response = await apiClient.processVoiceInput(input);
      return {
        message: response.response,
        voice_enabled: true,
        suggestions: [],
      } as VoiceResponse;
    }),
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

  return {
    themes: data?.themes || {},
    availableColors: data?.available_colors || [],
    loading,
    error,
    getThemes,
  };
}