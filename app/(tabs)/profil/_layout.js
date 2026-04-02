import { Stack } from 'expo-router';

export default function ProfilStackLayout() {
  return (
    <Stack 
      screenOptions={{ 
        // On cache le header par défaut de React Navigation 
        // car tu as déjà tes propres headers (les `<View style={styles.header}>...`)
        headerShown: false,
        // Optionnel : Ajoute une animation de glissement typique d'iOS/Android
        animation: 'slide_from_right', 
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="modifier" />
      <Stack.Screen name="confidentialite" />
      <Stack.Screen name="cgu" />
    </Stack>
  );
}