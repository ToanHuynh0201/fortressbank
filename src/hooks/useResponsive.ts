import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import {
	scale,
	verticalScale,
	moderateScale,
	fontSize as fs,
	spacing as sp,
} from '@/utils/responsive';

/**
 * Hook for accessing responsive values that update dynamically
 * @returns Responsive utilities and screen information
 */
export const useResponsive = () => {
	const { width, height } = useWindowDimensions();

	return useMemo(
		() => ({
			width,
			height,
			scale: (size: number) => scale(size),
			verticalScale: (size: number) => verticalScale(size),
			moderateScale: (size: number, factor?: number) =>
				moderateScale(size, factor),
			fontSize: (size: number) => fs(size),
			spacing: (size: number) => sp(size),
			isSmall: width < 376,
			isMedium: width >= 376 && width < 415,
			isLarge: width >= 415,
			breakpoint: (width < 376
				? 'small'
				: width < 415
					? 'medium'
					: 'large') as 'small' | 'medium' | 'large',
		}),
		[width, height],
	);
};

/**
 * Hook for creating responsive styles dynamically
 * @returns Responsive utilities with style creator helper
 */
export const useResponsiveStyle = () => {
	const responsive = useResponsive();

	return {
		...responsive,
		createStyle: <T extends Record<string, any>>(
			styleCreator: (r: ReturnType<typeof useResponsive>) => T,
		): T => {
			return styleCreator(responsive);
		},
	};
};
