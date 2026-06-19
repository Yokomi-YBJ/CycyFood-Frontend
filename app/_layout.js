// app/_layout.js
import { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AlertProvider } from '../context/AlertContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

// ── Guard principal ───────────────────────────────────────
function RootGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuth  = segments[0] === 'auth';
    const inAdmin = segments[0] === 'admin';

    if (!user && !inAuth) {
      router.replace('/auth/login');
    } else if (user?.role === 'admin' && !inAdmin) {
      router.replace('/admin');
    } else if (user && user.role !== 'admin' && (inAuth || inAdmin)) {
      router.replace('/(tabs)');
    }

    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, [user, loading, segments]);

  if (loading || !isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AlertProvider>
              <RootGuard />
            </AlertProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}