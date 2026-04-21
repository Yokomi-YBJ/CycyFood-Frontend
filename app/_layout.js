// app/_layout.js
import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import {
  View, Text, StyleSheet, Animated, Image, Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ── Écran de chargement animé ─────────────────────────────
function SplashLoading() {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const dot1       = useRef(new Animated.Value(0.3)).current;
  const dot2       = useRef(new Animated.Value(0.3)).current;
  const dot3       = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo apparaît
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
      }),
    ]).start();

    // Points clignotants en séquence
    const animDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );

    const anim1 = animDot(dot1, 0);
    const anim2 = animDot(dot2, 200);
    const anim3 = animDot(dot3, 400);
    anim1.start(); anim2.start(); anim3.start();

    return () => { anim1.stop(); anim2.stop(); anim3.stop(); };
  }, []);

  return (
    <View style={s.splash}>
      <StatusBar style="light" />
      <Animated.View style={[s.logoWrap, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        <Image source={require('../assets/logo.jpg')} style={s.logo} />
      </Animated.View>

      <Animated.View style={[s.brandWrap, { opacity: fadeAnim }]}>
        <Text style={s.brand}>Cycy-Food</Text>
        <Text style={s.tagline}>Local · Rapide · Délicieux</Text>
      </Animated.View>

      <View style={s.dotsRow}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[s.dot, { opacity: d }]} />
        ))}
      </View>
    </View>
  );
}

// ── Guard principal ───────────────────────────────────────
function RootGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router   = useRouter();
  const ready    = useRef(false);

  useEffect(() => {
    if (loading) return;

    // Petit délai pour que la navigation soit montée
    const timer = setTimeout(() => {
      const inAuth  = segments[0] === 'auth';
      const inAdmin = segments[0] === 'admin';

      if (!user) {
        if (!inAuth) router.replace('/auth/login');
      } else if (user.role === 'admin') {
        if (!inAdmin) router.replace('/admin');
      } else {
        if (inAuth || inAdmin) router.replace('/(tabs)');
      }
      ready.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading, segments]);

  // ← Afficher le splash TANT QUE loading est true
  // L'utilisateur ne voit JAMAIS l'index avant la redirection
  if (loading) return <SplashLoading />;

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
    <AuthProvider>
      <CartProvider>
        <RootGuard />
      </CartProvider>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logoWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20,
    elevation: 12,
  },
  logo: { width: 110, height: 110, resizeMode: 'cover' },
  brandWrap: { alignItems: 'center', marginBottom: 48 },
  brand: {
    fontSize: 36, fontWeight: '900',
    color: '#fff', letterSpacing: 1,
  },
  tagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)',
    marginTop: 6, letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row', gap: 10,
    position: 'absolute', bottom: 80,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#fff',
  },
});
