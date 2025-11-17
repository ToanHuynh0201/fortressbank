import { Stack } from 'expo-router';

export default function TransferLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 400,
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          animation: 'fade',
          animationDuration: 400,
        }}
      />
      <Stack.Screen 
        name="transfer" 
        options={{
          animation: 'fade',
          animationDuration: 400,
        }}
      />
      <Stack.Screen 
        name="transferFilled" 
        options={{
          animation: 'slide_from_right',
          animationDuration: 350,
        }}
      />
      <Stack.Screen 
        name="transferConfirmation" 
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 350,
        }}
      />
      <Stack.Screen 
        name="transferSuccess" 
        options={{
          animation: 'fade',
          animationDuration: 400,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
