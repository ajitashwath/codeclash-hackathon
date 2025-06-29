export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  GENERATE_SLIDE: '/api/generate-slide',
  CREATE_PRESENTATION: '/api/presentai',
  GET_PRESENTATION: '/api/presentations',
  UPDATE_PRESENTATION: '/api/presentations',
  COLOR_THEMES: '/api/color-themes',
  CHANGE_SLIDE_COLOR: '/api/slides',
  VOICE_GREETING: '/api/voice/greeting',
  VOICE_PROCESS: '/api/voice/process',
  QUICK_INSPIRATION: '/api/quick-inspiration',
  EXPORT_PPTX: '/api/export-pptx',
} as const;

export const DEFAULT_SLIDE_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 450,
  ASPECT_RATIO: 16 / 9,
} as const;

export const TOOL_TYPES = {
  SELECT: 'select',
  CROP: 'crop',
  ALIGNMENT: 'alignment',
  TEXT: 'text',
  SHAPE: 'shape',
  ERASER: 'eraser',
  TABLE: 'table',
} as const;

export const ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SHAPE: 'shape',
  BULLET_LIST: 'bulletList',
  TABLE: 'table',
} as const;

export const SHAPE_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
} as const;

export const TEXT_ALIGNMENTS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
} as const;

export const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'
] as const;

export const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
] as const;

export const VOICE_COMMANDS = {
  START_LISTENING: 'start listening',
  STOP_LISTENING: 'stop listening',
  CREATE_SLIDE: 'create slide',
  ADD_TEXT: 'add text',
  ADD_SHAPE: 'add shape',
  CHANGE_COLOR: 'change color',
  EXPORT: 'export',
  SAVE: 'save',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  UNAUTHORIZED: 'Unauthorized access. Please log in.',
  NOT_FOUND: 'Resource not found.',
  VOICE_NOT_SUPPORTED: 'Voice input is not supported in this browser.',
  EXPORT_FAILED: 'Export failed. Please try again.',
  SAVE_FAILED: 'Save failed. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  SLIDE_GENERATED: 'Slide generated successfully!',
  PRESENTATION_SAVED: 'Presentation saved successfully!',
  PRESENTATION_EXPORTED: 'Presentation exported successfully!',
  COLOR_CHANGED: 'Color theme changed successfully!',
  ELEMENT_ADDED: 'Element added successfully!',
  ELEMENT_DELETED: 'Element deleted successfully!',
} as const;

export const LOADING_MESSAGES = {
  GENERATING_SLIDE: 'Generating slide...',
  SAVING_PRESENTATION: 'Saving presentation...',
  EXPORTING_PRESENTATION: 'Exporting presentation...',
  LOADING_THEMES: 'Loading color themes...',
  PROCESSING_VOICE: 'Processing voice input...',
} as const;