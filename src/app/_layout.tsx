import {Stack} from "expo-router";

const RootLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 300,
        }}>
            <Stack.Screen 
                name="index"
                options={{
                    headerShown: false,
                    animation: 'fade',
                }}
            />
            <Stack.Screen 
                name="(auth)" 
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }} 
            />
            <Stack.Screen 
                name="(home)" 
                options={{
                    headerShown: false,
                    animation: 'fade',
                }} 
            />
            <Stack.Screen 
                name="(account)" 
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }} 
            />
            <Stack.Screen 
                name="(transfer)" 
                options={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                }} 
            />
        </Stack>
    );
};

export default RootLayout;
