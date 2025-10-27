import {Stack} from "expo-router";

const RootLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="(auth)" options={{headerShown: false}} />
            <Stack.Screen name="(home)" options={{headerShown: false}} />
        </Stack>
    );
};

export default RootLayout;
