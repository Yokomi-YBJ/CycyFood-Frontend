// app/_layout.js
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function RootGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth  = segments[0] === 'auth';
    const inAdmin = segments[0] === 'admin';
    const inTabs  = segments[0] === '(tabs)';

    if (!user) {
      // Non connecté → login
      if (!inAuth) router.replace('/auth/login');
    } else if (user.role === 'admin') {
      // Admin → espace admin
      if (!inAdmin) router.replace('/admin');
    } else {
      // Client → onglets
      if (inAuth || inAdmin) router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#FF6B35" translucent={false} />
      <Stack screenOptions={{ 
        headerShown: false,
      }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="profil" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootGuard />
      </CartProvider>
    </AuthProvider>
  );
}

