/**
 * Color Palette
 * Extracted from Figma Design System
 */

// Primary Colors
export const primary = {
  primary1: '#3629B7',
  primary2: '#5655B9',
  primary3: '#A8A3D7',
  primary4: '#F2F1F9',
} as const;

// Neutral Colors
export const neutral = {
  neutral1: '#343434',
  neutral2: '#898989',
  neutral3: '#989898',
  neutral4: '#CACACA',
  neutral5: '#E0E0E0',
  neutral6: '#FFFFFF',
} as const;

// Semantic Colors
export const semantic = {
  error: '#FF4267',
  info: '#0890FE',
  warning: '#FFAF2A',
  success: '#52D5BA',
  orange: '#FB6B18',
} as const;

// Consolidated Colors Object
export const colors = {
  primary,
  neutral,
  semantic,
} as const;

// Type Exports
export type PrimaryColor = keyof typeof primary;
export type NeutralColor = keyof typeof neutral;
export type SemanticColor = keyof typeof semantic;

export default colors;
