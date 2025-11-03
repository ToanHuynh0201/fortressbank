import { Stack } from 'expo-router';

export default function TransferLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="transfer" />
      <Stack.Screen name="transferFilled" />
      <Stack.Screen name="transferConfirmation" />
    </Stack>
  );
}
