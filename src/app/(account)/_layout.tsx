import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 400,
      }}
    >
      <Stack.Screen 
        name="accountCard" 
        options={{
          animation: 'fade',
          animationDuration: 400,
        }}
      />
      <Stack.Screen 
        name="cardDetail" 
        options={{
          animation: 'slide_from_right',
          animationDuration: 350,
        }}
      />
    </Stack>
  );
}
