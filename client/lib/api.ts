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
      
      // Return fallback data for development
      if (endpoint === '/api/health') {
        return { status: 'healthy', gemini_configured: false } as T;
      }
      if (endpoint === '/api/color-themes') {
        return {
          themes: {
            blue: { background: '#dbeafe', primary: '#2563eb', secondary: '#93c5fd', text: '#1e3a8a', accent: '#3b82f6' },
            red: { background: '#fee2e2', primary: '#dc2626', secondary: '#fca5a5', text: '#7f1d1d', accent: '#ef4444' },
            green: { background: '#dcfce7', primary: '#16a34a', secondary: '#86efac', text: '#14532d', accent: '#22c55e' },
            purple: { background: '#f3e8ff', primary: '#9333ea', secondary: '#c4b5fd', text: '#581c87', accent: '#a855f7' }
          },
          available_colors: ['blue', 'red', 'green', 'purple']
        } as T;
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; gemini_configured: boolean }> {
    return this.request('/api/health');
  }

  // AI Generation
  async generateSlide(prompt: string, colorTheme: string = 'blue'): Promise<{ slide: any; ai_response: any }> {
    try {
      return await this.request('/api/generate-slide', {
        method: 'POST',
        body: JSON.stringify({ prompt, color_theme: colorTheme }),
      });
    } catch (error) {
      // Fallback slide generation
      const fallbackSlide = {
        id: Date.now(),
        title: `Generated: ${prompt}`,
        content: `Content for: ${prompt}`,
        notes: "",
        elements: [
          {
            id: `title_${Date.now()}`,
            type: "text",
            content: `Generated: ${prompt}`,
            x: 50,
            y: 80,
            width: 700,
            height: 60,
            style: { fontSize: "24px", fontWeight: "bold", color: "#2563eb" }
          },
          {
            id: `content_${Date.now()}`,
            type: "text",
            content: `This slide was generated from: "${prompt}"\n\n• Key point 1\n• Key point 2\n• Key point 3`,
            x: 50,
            y: 180,
            width: 700,
            height: 200,
            style: { fontSize: "16px", color: "#1e3a8a" }
          }
        ],
        theme: "professional",
        layout: "bullet-list",
        color_theme: colorTheme
      };
      
      return {
        slide: fallbackSlide,
        ai_response: {
          title: `Generated: ${prompt}`,
          content: `Content for: ${prompt}`,
          bullet_points: ["Key point 1", "Key point 2", "Key point 3"],
          design_theme: "professional",
          layout_type: "bullet-list"
        }
      };
    }
  }

  async quickInspiration(inspiration: string): Promise<{ slide_content: any }> {
    return this.request('/api/quick-inspiration', {
      method: 'POST',
      body: JSON.stringify({ inspiration }),
    });
  }

  // Presentation Management
  async createPresentation(prompt: string, slides: any[] = [], colorTheme: string = 'blue'): Promise<{ presentation_id: string; slides: any[] }> {
    try {
      return await this.request('/api/presentai', {
        method: 'POST',
        body: JSON.stringify({ prompt, slides, color_theme: colorTheme }),
      });
    } catch (error) {
      // Fallback for offline mode
      return {
        presentation_id: `offline_${Date.now()}`,
        slides: slides
      };
    }
  }

  async getPresentation(presentationId: string): Promise<any> {
    return this.request(`/api/presentations/${presentationId}`);
  }

  async updatePresentation(presentationId: string, slides: any[]): Promise<{ presentation: any }> {
    return this.request(`/api/presentations/${presentationId}`, {
      method: 'PUT',
      body: JSON.stringify({ slides }),
    });
  }

  async listPresentations(): Promise<{ presentations: any[]; count: number }> {
    return this.request('/api/presentations');
  }

  // Color Themes
  async getColorThemes(): Promise<{ themes: Record<string, any>; available_colors: string[] }> {
    return this.request('/api/color-themes');
  }

  async changeSlideColor(slideId: number, colorTheme: string, presentationId?: string): Promise<{ color_theme: string; background_color: string }> {
    return this.request(`/api/slides/${slideId}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color_theme: colorTheme, presentation_id: presentationId }),
    });
  }

  // Voice Interaction
  async getVoiceGreeting(): Promise<any> {
    return this.request('/api/voice/greeting');
  }

  async processVoiceInput(input: string): Promise<{ response: string; should_generate: boolean; topic?: string }> {
    return this.request('/api/voice/process', {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  // Export
  async exportToPPTX(slides: any[]): Promise<Blob> {
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