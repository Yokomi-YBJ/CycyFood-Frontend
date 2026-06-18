// app/_layout.js
import { useState, useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { AlertProvider } from '../context/AlertContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  View, Text, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// ── Splash Screen moderne ─────────────────────────────────
function SplashLoading() {
  // Animations
  const bgAnim      = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale  = useRef(new Animated.Value(0.6)).current;
  const ring1Opacity= useRef(new Animated.Value(0)).current;
  const ring2Scale  = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity= useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(20)).current;
  const taglineOp   = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;
  const dot2Anim    = useRef(new Animated.Value(0)).current;
  const dot3Anim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse des rings en boucle
    const pulseRing = (scale, opacity, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.4, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 0.35, duration: 200, useNativeDriver: true }),
              Animated.timing(opacity, { toValue: 0, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            ]),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
    };

    const ring1Pulse = pulseRing(ring1Scale, ring1Opacity, 0);
    const ring2Pulse = pulseRing(ring2Scale, ring2Opacity, 700);

    // Dots loading animation
    const animateDots = () => {
      const dotSequence = (dot) => Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ]);
      return Animated.loop(
        Animated.stagger(200, [
          dotSequence(dotAnim),
          dotSequence(dot2Anim),
          dotSequence(dot3Anim),
        ])
      );
    };

    // Séquence principale
    Animated.sequence([
      // 1. Logo apparaît avec spring
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // 2. Texte glisse
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      // 3. Tagline
      Animated.timing(taglineOp, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    ring1Pulse.start();
    ring2Pulse.start();
    const dots = animateDots();
    // Démarrer les dots après un court délai
    setTimeout(() => dots.start(), 800);

    return () => {
      ring1Pulse.stop();
      ring2Pulse.stop();
      dots.stop();
    };
  }, []);

  return (
    <View style={s.splash}>
      <StatusBar style="light" />

      {/* Cercles décoratifs */}
      <View style={s.decorCircle1} />
      <View style={s.decorCircle2} />
      <View style={[s.decorCircle3]} />

      {/* Rings pulsantes autour du logo */}
      <Animated.View style={[
        s.ring,
        { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }
      ]} />
      <Animated.View style={[
        s.ring,
        { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }
      ]} />

      {/* Logo central */}
      <Animated.View style={[
        s.logoWrap,
        { transform: [{ scale: logoScale }], opacity: logoOpacity }
      ]}>
        {/* Icône stylisée — assiette avec vapeur */}
        <View style={s.logoInner}>
          {/* Assiette */}
          <View style={s.plate} />
          {/* Vapeur stylisée */}
          <View style={[s.steam, { left: 28, top: 14 }]} />
          <View style={[s.steam, { left: 44, top: 10 }]} />
          <View style={[s.steam, { left: 60, top: 14 }]} />
          {/* Lettre L */}
          <Text style={s.logoLetter}>L</Text>
        </View>
      </Animated.View>

      {/* Nom de l'app */}
      <Animated.View style={[s.textBlock, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        <Text style={s.brandName}>LaTchop</Text>
      </Animated.View>

      {/* Tagline avec points colorés */}
      <Animated.View style={[s.taglineRow, { opacity: taglineOp }]}>
        <View style={[s.dot, { backgroundColor: '#fff' }]} />
        <Text style={s.taglineText}>Local</Text>
        <View style={[s.dot, { backgroundColor: COLORS.accent }]} />
        <Text style={s.taglineText}>Rapide</Text>
        <View style={[s.dot, { backgroundColor: '#fff' }]} />
        <Text style={s.taglineText}>Délicieux</Text>
      </Animated.View>

      {/* Loader dots */}
      <View style={s.loaderRow}>
        {[dotAnim, dot2Anim, dot3Anim].map((anim, i) => (
          <Animated.View key={i} style={[s.loaderDot, { opacity: anim }]} />
        ))}
      </View>

      {/* Badge ville */}
      <View style={s.cityBadge}>
        <Text style={s.cityText}>📍 Ngaoundéré</Text>
      </View>
    </View>
  );
}

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
    return <SplashLoading />;
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

const LOGO_SIZE = 110;
const RING_SIZE = LOGO_SIZE + 60;

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Cercles déco
  decorCircle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -width * 0.6,
    right: -width * 0.3,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: height * 0.12,
    left: -60,
  },
  decorCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.08)',
    bottom: height * 0.3,
    right: 20,
  },

  // Rings pulsantes
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Logo
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: LOGO_SIZE / 2,
  },
  plate: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: COLORS.primary,
    bottom: 10,
  },
  steam: {
    position: 'absolute',
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  logoLetter: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: -20,
    letterSpacing: -2,
  },

  // Texte
  textBlock: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },

  // Tagline
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xxl,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.7,
  },
  taglineText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Loader
  loaderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // Badge ville
  cityBadge: {
    position: 'absolute',
    bottom: 48,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cityText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
});
