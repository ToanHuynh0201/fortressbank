import { Stack } from 'expo-router';

export default function TransferLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="transfer" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="transferFilled" 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="transferConfirmation" 
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="transferSuccess" 
        options={{
          animation: 'fade',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
