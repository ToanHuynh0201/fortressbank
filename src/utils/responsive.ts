import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 12/13/14 standard
const BASE_HEIGHT = 844;

/**
 * Scale a value based on the screen width
 * @param size - The base size to scale
 * @returns Scaled value
 */
export const scale = (size: number): number => {
	return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale a value based on the screen height
 * @param size - The base size to scale
 * @returns Scaled value
 */
export const verticalScale = (size: number): number => {
	return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderately scale a value with a customizable factor
 * @param size - The base size to scale
 * @param factor - Scaling factor (0 = no scaling, 1 = full scaling)
 * @returns Scaled value
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
	return size + (scale(size) - size) * factor;
};

/**
 * Scale font size with constraints to ensure readability
 * @param size - The base font size
 * @returns Scaled font size with min/max constraints
 */
export const fontSize = (size: number): number => {
	const scaled = moderateScale(size, 0.3);
	const min = size * 0.85;
	const max = size * 1.15;
	return Math.min(Math.max(scaled, min), max);
};

/**
 * Scale spacing (padding, margin) with constraints
 * @param size - The base spacing value
 * @returns Scaled spacing with min/max constraints
 */
export const spacing = (size: number): number => {
	const scaled = scale(size);
	const min = size * 0.8;
	const max = size * 1.2;
	return Math.min(Math.max(scaled, min), max);
};

/**
 * Get the current screen breakpoint category
 * @returns 'small' | 'medium' | 'large'
 */
export const getBreakpoint = (): 'small' | 'medium' | 'large' => {
	if (SCREEN_WIDTH < 376) return 'small';
	if (SCREEN_WIDTH < 415) return 'medium';
	return 'large';
};

export { SCREEN_WIDTH, SCREEN_HEIGHT, BASE_WIDTH, BASE_HEIGHT };
