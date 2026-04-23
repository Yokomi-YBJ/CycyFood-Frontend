// app/auth/login.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert, Image,
  StatusBar,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { connexion } = useAuth();
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnexion = async () => {
    if (!telephone || !password) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    if (telephone.length !== 9) {
      Alert.alert('Téléphone invalide', 'Le numéro doit contenir 9 chiffres.');
      return;
    }
    setLoading(true);
    try {
      const data = await connexion(telephone, password);
      if (data.status === 'success') {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (e) {
      Alert.alert('Problème de connexion', 'Le serveur est inaccessible. Vérifiez votre internet et le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          style={styles.scrollBase}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImg} />
            </View>
            <Text style={styles.brandName}>LaTchop</Text>
            <Text style={styles.tagline}>Local • Rapide • Délicieux</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Connectez-vous pour commander.</Text>

            {/* Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 699887766"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={telephone}
                  onChangeText={setTelephone}
                  autoCorrect={false}
                  autoComplete="off"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCorrect={false}
                  autoComplete="off"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton connexion */}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleConnexion} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnPrimaryText}>Se connecter</Text>
              }
            </TouchableOpacity>

            {/* Lien inscription */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>Pas encore de compte ? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  // FIX: backgroundColor ici aussi pour que le ScrollView couvre tout
  scrollBase: { backgroundColor: '#FF6B35' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  // FIX: logo harmonisé à 80
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    overflow: 'hidden',
  },
  logoImg: { width: 80, height: 80, resizeMode: 'cover' },
  brandName: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 12,
    paddingHorizontal: 12, backgroundColor: '#fafafa', height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 52, fontSize: 15, color: '#1a1a1a' },
  inputFlex: { flex: 1, height: 52, fontSize: 15, color: '#1a1a1a' },
  eyeBtn: { padding: 8 },
  btnPrimary: {
    backgroundColor: '#FF6B35', borderRadius: 14,
    height: 54, alignItems: 'center', justifyContent: 'center',
    marginTop: 8, shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 10, elevation: 6,
  },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: '#888', fontSize: 14 },
  link: { color: '#FF6B35', fontSize: 14, fontWeight: '700' },
});