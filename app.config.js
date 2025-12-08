export default {
	expo: {
		name: "fortressbank",
		slug: "fortressbank",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/icon.png",
		userInterfaceStyle: "light",
		newArchEnabled: true,
		scheme: "fortressbank",
		splash: {
			image: "./assets/splash-icon.png",
			resizeMode: "contain",
			backgroundColor: "#ffffff",
		},
		ios: {
			supportsTablet: true,
		},
		android: {
			package: "com.fortressbank.app",
			adaptiveIcon: {
				foregroundImage: "./assets/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			edgeToEdgeEnabled: false,
			predictiveBackGestureEnabled: false,
		},
		web: {
			favicon: "./assets/favicon.png",
		},
		plugins: ["expo-router", "expo-dev-client"],
		extra: {
			API_BASE_URL:
				process.env.EXPO_PUBLIC_API_BASE_URL ||
				"http://localhost:3000/api",
			API_LOCATION_URL:
				process.env.EXPO_PUBLIC_API_LOCATION_URL ||
				"http://localhost:3030/api",
			// eas: {
			// 	projectId: "35387e00-35d0-47f8-911b-40097f9bf5be",
			// },
		},
		// owner: "toanhuynh0201",
	},
};
