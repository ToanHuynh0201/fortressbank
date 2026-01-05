import { LogBox } from "react-native";
import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import App from "./App";

// Disable LogBox for demo purposes
LogBox.ignoreAllLogs(true);

// Register background message handler
// This must be called outside of any component and before registering the app
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	console.log("📩 Message handled in the background!", remoteMessage);

	// You can perform background tasks here
	// For example: save to local storage, update badge count, etc.
});

// Register the app component
registerRootComponent(App);
