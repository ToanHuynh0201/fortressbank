import {Stack} from "expo-router";

const RootLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="index" options={{title: "Home"}} />
            <Stack.Screen name="(auth)" options={{headerShown: false}} />
        </Stack>
    );
};

export default RootLayout;
