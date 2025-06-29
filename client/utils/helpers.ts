import { Slide, SlideElement } from '@/types/slide';
import { DEFAULT_SLIDE_DIMENSIONS, ELEMENT_TYPES } from './constants';

export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateSlideData(slide: Partial<Slide>): boolean {
  return !!(slide.title && slide.elements && Array.isArray(slide.elements));
}

export function validateElementData(element: Partial<SlideElement>): boolean {
  return !!(
    element.id &&
    element.type &&
    Object.values(ELEMENT_TYPES).includes(element.type as any) &&
    typeof element.x === 'number' &&
    typeof element.y === 'number' &&
    typeof element.width === 'number' &&
    typeof element.height === 'number'
  );
}

export function sanitizeSlideTitle(title: string): string {
  return title.trim().slice(0, 100) || 'Untitled Slide';
}

export function sanitizeElementContent(content: string): string {
  return content.trim().slice(0, 1000);
}

export function calculateElementBounds(element: SlideElement) {
  return {
    left: element.x,
    top: element.y,
    right: element.x + element.width,
    bottom: element.y + element.height,
  };
}

export function isElementInBounds(element: SlideElement, bounds: { width: number; height: number }): boolean {
  const elementBounds = calculateElementBounds(element);
  return (
    elementBounds.left >= 0 &&
    elementBounds.top >= 0 &&
    elementBounds.right <= bounds.width &&
    elementBounds.bottom <= bounds.height
  );
}

export function constrainElementToBounds(element: SlideElement, bounds: { width: number; height: number }): SlideElement {
  const constrainedElement = { ...element };
  
  // Constrain position
  constrainedElement.x = Math.max(0, Math.min(element.x, bounds.width - element.width));
  constrainedElement.y = Math.max(0, Math.min(element.y, bounds.height - element.height));
  
  // Constrain size
  constrainedElement.width = Math.min(element.width, bounds.width - constrainedElement.x);
  constrainedElement.height = Math.min(element.height, bounds.height - constrainedElement.y);
  
  return constrainedElement;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Copy to clipboard failed'));
      }
      document.body.removeChild(textArea);
    });
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function extractTextFromElements(elements: SlideElement[]): string {
  return elements
    .filter(el => el.type === 'text' || el.type === 'bulletList')
    .map(el => el.content)
    .join(' ')
    .trim();
}

export function calculateSlideAspectRatio(width: number, height: number): number {
  return width / height;
}

export function getOptimalFontSize(text: string, maxWidth: number, maxHeight: number): string {
  const baseSize = 16;
  const textLength = text.length;
  
  if (textLength < 50) return `${Math.min(24, baseSize * 1.5)}px`;
  if (textLength < 100) return `${baseSize}px`;
  if (textLength < 200) return `${Math.max(12, baseSize * 0.8)}px`;
  
  return '12px';
}

export function generateSlidePreview(slide: Slide): string {
  const textContent = extractTextFromElements(slide.elements);
  return textContent.slice(0, 100) + (textContent.length > 100 ? '...' : '');
}