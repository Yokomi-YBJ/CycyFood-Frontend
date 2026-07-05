// app/_layout.js
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AlertProvider } from '../context/AlertContext';
import { LanguageProvider } from '../context/LanguageContext';
import { CommandeLimitProvider } from '../context/CommandeLimitContext';
import { ConfigProvider, useConfig } from '../context/ConfigContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// ── Guard principal ───────────────────────────────────────
function RootGuard() {
  const { user, loading } = useAuth();
  const { config } = useConfig();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading || config.isLoading) return;

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
  }, [user, loading, config.isLoading, segments]);

  if (loading || config.isLoading || (config.maintenance_mode && !isReady)) {
    return null;
  }

  // Si maintenance mode est actif, on affiche un écran de maintenance au lieu de la Stack
  if (config.maintenance_mode) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
        <Ionicons name="hammer-outline" size={80} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: SPACING.lg }}>Maintenance</Text>
        <Text style={{ color: '#fff', opacity: 0.8, textAlign: 'center', marginTop: SPACING.sm }}>
          Nous effectuons une mise à jour pour mieux vous servir. Revenez bientôt !
        </Text>
      </View>
    );
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
            <CommandeLimitProvider>
              <AlertProvider>
                <ConfigProvider>
                  <RootGuard />
                </ConfigProvider>
              </AlertProvider>
            </CommandeLimitProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
