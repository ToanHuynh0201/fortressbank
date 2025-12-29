import { scale, fontSize, spacing } from '@/utils/responsive';

/**
 * Responsive typography scale
 */
export const typography = {
	h1: fontSize(28),
	h2: fontSize(24),
	h3: fontSize(20),
	title: fontSize(24),
	subtitle: fontSize(18),
	body: fontSize(15),
	bodySmall: fontSize(14),
	caption: fontSize(12),
	label: fontSize(12),
	tiny: fontSize(10),
	button: fontSize(15),
};

/**
 * Responsive spacing scale (based on 8px grid)
 */
export const spacingScale = {
	xs: spacing(4),
	sm: spacing(8),
	md: spacing(12),
	lg: spacing(16),
	xl: spacing(24),
	xxl: spacing(32),
	xxxl: spacing(40),
};

/**
 * Responsive component sizes
 */
export const componentSizes = {
	buttonHeight: scale(48),
	inputHeight: scale(44),
	headerHeight: scale(60),
	tabBarHeight: scale(60),
	iconSmall: scale(16),
	iconMedium: scale(24),
	iconLarge: scale(32),
	avatarSmall: scale(32),
	avatarMedium: scale(48),
	avatarLarge: scale(64),
};

/**
 * Responsive border radius
 */
export const borderRadius = {
	xs: scale(4),
	sm: scale(8),
	md: scale(12),
	lg: scale(15),
	xl: scale(20),
	xxl: scale(30),
	full: 9999,
};
