// app/auth/login.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Image,
  StatusBar, Dimensions, Animated,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { connexion } = useAuth();
  const { showAlert } = useAlert();
  const [telephone, setTelephone] = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState(null);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOp   = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(cardOp, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleConnexion = async () => {
    if (!telephone || !password) {
      showAlert({ title: 'Champs manquants', message: 'Veuillez remplir tous les champs.', type: 'warning' });
      return;
    }
    if (telephone.length !== 9) {
      showAlert({ title: 'Téléphone invalide', message: 'Le numéro doit contenir 9 chiffres.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const data = await connexion(telephone, password);
      if (data.status === 'success') {
        router.replace('/(tabs)');
      } else {
        showAlert({ title: 'Connexion refusée', message: data.message, type: 'error' });
      }
    } catch {
      showAlert({
        title: 'Serveur inaccessible',
        message: 'Vérifiez votre connexion internet et réessayez.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Fond dégradé avec formes déco ─────────────── */}
      <View style={s.bg}>
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />
        <View style={s.bgWave} />
      </View>

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header / Branding ──────────────────────── */}
          <View style={s.brandArea}>
            <View style={s.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={s.brandName}>LaTchop</Text>
            <Text style={s.brandTagline}>Local · Rapide · Délicieux</Text>
          </View>

          {/* ── Card de connexion ──────────────────────── */}
          <Animated.View style={[s.card, {
            opacity: cardOp,
            transform: [{ translateY: cardAnim }],
          }]}>
            <Text style={s.cardTitle}>Bienvenue !</Text>
            <Text style={s.cardSubtitle}>Connectez-vous pour continuer</Text>

            {/* Téléphone */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Numéro de téléphone</Text>
              <View style={[s.fieldRow, focused === 'tel' && s.fieldRowFocused]}>
                <View style={s.fieldIconWrap}>
                  <Ionicons name="call" size={18} color={focused === 'tel' ? COLORS.primary : COLORS.text.disabled} />
                </View>
                <TextInput
                  style={s.fieldInput}
                  placeholder="Ex : 699 887 766"
                  placeholderTextColor={COLORS.text.disabled}
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={telephone}
                  onChangeText={setTelephone}
                  onFocus={() => setFocused('tel')}
                  onBlur={() => setFocused(null)}
                  autoCorrect={false}
                />
                {telephone.length === 9 && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                )}
              </View>
            </View>

            {/* Mot de passe */}
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>Mot de passe</Text>
              <View style={[s.fieldRow, focused === 'pass' && s.fieldRowFocused]}>
                <View style={s.fieldIconWrap}>
                  <Ionicons name="lock-closed" size={18} color={focused === 'pass' ? COLORS.primary : COLORS.text.disabled} />
                </View>
                <TextInput
                  style={s.fieldInput}
                  placeholder="Votre mot de passe"
                  placeholderTextColor={COLORS.text.disabled}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.text.disabled}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.btnLogin, loading && { opacity: 0.7 }]}
              onPress={handleConnexion}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Text style={s.btnLoginText}>Se connecter</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color="rgba(255,255,255,0.7)" />
                  </>
                )
              }
            </TouchableOpacity>

            {/* Lien inscription */}
            <View style={s.signupRow}>
              <Text style={s.signupText}>Pas encore de compte ? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                  <Text style={s.signupLink}>S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  kav: { flex: 1 },

  bg: { ...StyleSheet.absoluteFillObject },
  bgCircle1: {
    position: 'absolute', width: width * 0.9, height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -width * 0.3, left: -width * 0.2,
  },
  bgCircle2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: height * 0.05, right: -40,
  },
  bgWave: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: height * 0.55,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xl,
  },

  brandArea: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: SPACING.xxl,
  },
  logoBox: {
    width: 90, height: 90, borderRadius: RADIUS.xl,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.heavy,
    padding: 8,
  },
  logoImg: { width: '100%', height: '100%' },
  brandName: {
    fontSize: 38, fontWeight: '900', color: '#fff',
    letterSpacing: -1, marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.75)',
    fontWeight: '500', letterSpacing: 0.5,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    ...SHADOWS.heavy,
  },
  cardTitle: {
    fontSize: 26, fontWeight: '900', color: COLORS.text.primary,
    letterSpacing: -0.5, marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14, color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },

  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.text.primary,
    marginBottom: 7,
  },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingRight: SPACING.md,
    height: 54,
  },
  fieldRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '06',
  },
  fieldIconWrap: {
    width: 50, alignItems: 'center', justifyContent: 'center',
  },
  fieldInput: { flex: 1, fontSize: 16, color: COLORS.text.primary, height: 54 },
  eyeBtn: { padding: 6 },

  btnLogin: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnLoginText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  signupRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: SPACING.lg,
  },
  signupText: { fontSize: 14, color: COLORS.text.secondary },
  signupLink: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
});
