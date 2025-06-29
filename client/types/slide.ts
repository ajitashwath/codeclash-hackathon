export interface SlideElement {
  id: string;
  type: "text" | "image" | "shape" | "bulletList" | "table";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: {
    backgroundColor?: string;
    borderRadius?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: "left" | "center" | "right";
    color?: string;
    shapeType?: "rectangle" | "circle" | "triangle";
    listItems?: string[];
    imageUrl?: string;
    lineHeight?: string;
  };
  tableData?: {
    rows: number;
    cols: number;
    cells: string[][];
  };
}

export interface Slide {
  id: number;
  title: string;
  content: string;
  notes: string;
  elements: SlideElement[];
  theme?: string;
  layout?: string;
  color_theme?: string;
  background_color?: string;
  ai_metadata?: {
    original_prompt?: string;
    generated_at?: string;
  };
}

export interface HistoryState {
  slides: Slide[];
  currentSlide: number;
}

export interface Presentation {
  id: string;
  prompt?: string;
  slides: Slide[];
  default_color_theme?: string;
  created_at: string;
  updated_at: string;
}

export interface AIResponse {
  title: string;
  content: string;
  bullet_points: string[];
  design_theme: string;
  layout_type: string;
}

export interface VoiceResponse {
  message: string;
  voice_enabled: boolean;
  suggestions?: string[];
}

export interface ColorTheme {
  background: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
}

export interface ApiError {
  error: string;
  details?: string;
}