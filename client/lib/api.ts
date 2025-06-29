import { Slide, Presentation, AIResponse, VoiceResponse, ColorTheme, ApiError } from '@/types/slide';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; gemini_configured: boolean }> {
    return this.request('/api/health');
  }

  // AI Generation
  async generateSlide(prompt: string, colorTheme: string = 'blue'): Promise<{ slide: Slide; ai_response: AIResponse }> {
    return this.request('/api/generate-slide', {
      method: 'POST',
      body: JSON.stringify({ prompt, color_theme: colorTheme }),
    });
  }

  async quickInspiration(inspiration: string): Promise<{ slide_content: AIResponse }> {
    return this.request('/api/quick-inspiration', {
      method: 'POST',
      body: JSON.stringify({ inspiration }),
    });
  }

  // Presentation Management
  async createPresentation(prompt: string, slides: Slide[] = [], colorTheme: string = 'blue'): Promise<{ presentation_id: string; slides: Slide[] }> {
    return this.request('/api/presentai', {
      method: 'POST',
      body: JSON.stringify({ prompt, slides, color_theme: colorTheme }),
    });
  }

  async getPresentation(presentationId: string): Promise<Presentation> {
    return this.request(`/api/presentations/${presentationId}`);
  }

  async updatePresentation(presentationId: string, slides: Slide[]): Promise<{ presentation: Presentation }> {
    return this.request(`/api/presentations/${presentationId}`, {
      method: 'PUT',
      body: JSON.stringify({ slides }),
    });
  }

  async listPresentations(): Promise<{ presentations: Presentation[]; count: number }> {
    return this.request('/api/presentations');
  }

  // Color Themes
  async getColorThemes(): Promise<{ themes: Record<string, ColorTheme>; available_colors: string[] }> {
    return this.request('/api/color-themes');
  }

  async changeSlideColor(slideId: number, colorTheme: string, presentationId?: string): Promise<{ color_theme: string; background_color: string }> {
    return this.request(`/api/slides/${slideId}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color_theme: colorTheme, presentation_id: presentationId }),
    });
  }

  // Voice Interaction
  async getVoiceGreeting(): Promise<VoiceResponse> {
    return this.request('/api/voice/greeting');
  }

  async processVoiceInput(input: string): Promise<{ response: string; should_generate: boolean; topic?: string }> {
    return this.request('/api/voice/process', {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  // Export
  async exportToPPTX(slides: Slide[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/export-pptx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slides }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(errorData.error || 'Export failed');
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();
export default apiClient;