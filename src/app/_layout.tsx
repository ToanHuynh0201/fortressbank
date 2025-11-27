import { Stack } from "expo-router";
import { NotificationProvider } from "@/contexts";

const RootLayout = () => {
	return (
		<NotificationProvider>
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
					name="qrScanner"
					options={{
						headerShown: false,
						animation: "slide_from_bottom",
					}}
				/>
				<Stack.Screen
					name="beneficiaries"
					options={{
						headerShown: false,
						animation: "slide_from_right",
					}}
				/>
				<Stack.Screen
					name="addBeneficiary"
					options={{
						headerShown: false,
						animation: "slide_from_right",
					}}
				/>
			</Stack>
		</NotificationProvider>
	);
};

export default RootLayout;
