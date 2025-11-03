import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="accountCard" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="cardDetail" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
