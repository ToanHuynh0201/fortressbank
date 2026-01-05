import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { AuthProvider, NotificationProvider } from "@/contexts";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationListeners } from "@/hooks/useNotificationListeners";
import NotificationToast from "@/components/common/NotificationToast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { OfflineBar } from "@/components/common/OfflineBar";

// Tắt tất cả các thông báo lỗi màu đỏ/vàng trong React Native
LogBox.ignoreAllLogs(true);

const AppContent = () => {
	const { user } = useAuth();

	// Initialize notification listeners
	useNotificationListeners(user?.id || user?.userId);

	return (
		<Stack
					screenOptions={{
						headerShown: false,
						animation: "fade",
						animationDuration: 300,
					}}>
					<Stack.Screen
						name="index"
						options={{
							headerShown: false,
							animation: "slide_from_right",
						}}
					/>
					<Stack.Screen
						name="(auth)"
						options={{
							headerShown: false,
							animation: "fade",
							animationDuration: 400,
						}}
					/>
					<Stack.Screen
						name="(home)"
						options={{
							headerShown: false,
							animation: "fade",
						}}
					/>
					<Stack.Screen
						name="(account)"
						options={{
							headerShown: false,
							animation: "slide_from_right",
						}}
					/>
					<Stack.Screen
						name="(transfer)"
						options={{
							headerShown: false,
							animation: "slide_from_bottom",
						}}
					/>
					<Stack.Screen
						name="(beneficiaries)"
						options={{
							headerShown: false,
							animation: "slide_from_right",
						}}
					/>
				</Stack>
	);
};

const RootLayout = () => {
	return (
		<ErrorBoundary>
			<AuthProvider>
				<NotificationProvider>
					<OfflineBar />
					<AppContent />
					<NotificationToast />
				</NotificationProvider>
			</AuthProvider>
		</ErrorBoundary>
	);
};

export default RootLayout;
