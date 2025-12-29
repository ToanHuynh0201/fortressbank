import { Router } from "expo-router";

/**
 * Safely navigate back if possible, otherwise do nothing
 * @param router - The expo-router instance
 */
export const safeGoBack = (router: Router): void => {
	if (router.canGoBack()) {
		router.back();
	}
};

/**
 * Safely navigate back if possible, otherwise navigate to fallback route
 * @param router - The expo-router instance
 * @param fallbackRoute - The route to navigate to if can't go back
 */
export const safeGoBackOrNavigate = (
	router: Router,
	fallbackRoute: string,
): void => {
	if (router.canGoBack()) {
		router.back();
	} else {
		router.replace(fallbackRoute as any);
	}
};
