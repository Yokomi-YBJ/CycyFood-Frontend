// app/auth/signup.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image, StatusBar, Modal, Animated, Dimensions, Linking,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// l'URL de ta politique de confidentialité en ligne
const URL_POLITIQUE = 'https://cycy-food-politique-de-confidential.vercel.app/';

const QUARTIERS = [
  { label: 'Baladji', value: 'Baladji', arr: '1' },
  { label: 'Bamyanga', value: 'Bamyanga', arr: '1' },
  { label: 'Bini-Dang', value: 'Bini-Dang', arr: '1' },
  { label: 'Burkina', value: 'Burkina', arr: '1' },
  { label: 'Dang', value: 'Dang', arr: '1' },
  { label: 'Gadamabanga', value: 'Gadamabanga', arr: '1' },
  { label: 'Joli-Soir', value: 'Joli-Soir', arr: '1' },
  { label: 'Mbideng', value: 'Mbideng', arr: '1' },
  { label: 'Ngaoundaba', value: 'Ngaoundaba', arr: '1' },
  { label: 'Sabongari', value: 'Sabongari', arr: '1' },
  { label: 'Bamoun', value: 'Bamoun', arr: '2' },
  { label: 'Centre Commercial', value: 'Centre Commercial', arr: '2' },
  { label: 'Château', value: 'Château', arr: '2' },
  { label: 'Hamakoussou', value: 'Hamakoussou', arr: '2' },
  { label: 'Hippodrome', value: 'Hippodrome', arr: '2' },
  { label: 'Marché Central', value: 'Marché Central', arr: '2' },
  { label: 'Mbidou', value: 'Mbidou', arr: '2' },
  { label: 'Plateau', value: 'Plateau', arr: '2' },
  { label: 'Rue de Garoua', value: 'Rue de Garoua', arr: '2' },
  { label: 'Socaret', value: 'Socaret', arr: '2' },
  { label: 'Beka', value: 'Beka', arr: '3' },
  { label: 'Béré', value: 'Béré', arr: '3' },
  { label: 'Bilanga', value: 'Bilanga', arr: '3' },
  { label: 'Djalingo', value: 'Djalingo', arr: '3' },
  { label: 'Gounfan', value: 'Gounfan', arr: '3' },
  { label: 'Maourou', value: 'Maourou', arr: '3' },
  { label: 'Mbitom', value: 'Mbitom', arr: '3' },
  { label: 'Nganha', value: 'Nganha', arr: '3' },
  { label: 'Wack', value: 'Wack', arr: '3' },
  { label: 'Wolordé', value: 'Wolordé', arr: '3' },
];

const ETAPES = [
  { titre: 'Qui êtes-vous ?', sous: 'Étape 1 sur 3', icon: 'person-outline' },
  { titre: 'Où habitez-vous ?', sous: 'Étape 2 sur 3', icon: 'location-outline' },
  { titre: 'Sécurisez votre compte', sous: 'Étape 3 sur 3', icon: 'lock-closed-outline' },
];

export default function SignupScreen() {
  const router = useRouter();
  const { inscription } = useAuth();

  const [etape, setEtape] = useState(0);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [copassword, setCopassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showCoPass, setShowCoPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [acceptePolitique, setAcceptePolitique] = useState(false);
  const [checkboxShake, setCheckboxShake] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const animer = (direction) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -40 : 40,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation secousse pour la checkbox si non cochée
  const animerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const quartiersFiltres = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  const validerEtape = () => {
    if (etape === 0) {
      if (!nom.trim()) return Alert.alert('Champ requis', 'Veuillez entrer votre nom.');
      if (!prenom.trim()) return Alert.alert('Champ requis', 'Veuillez entrer votre prénom.');
    }
    if (etape === 1) {
      if (!adresse) return Alert.alert('Champ requis', 'Veuillez choisir votre quartier.');
      if (!telephone || telephone.length !== 9) return Alert.alert('Téléphone invalide', 'Le numéro doit contenir 9 chiffres.');
    }
    animer('next');
    setEtape(e => e + 1);
  };

  const retour = () => {
    animer('back');
    setEtape(e => e - 1);
  };

  const handleInscription = async () => {
    if (password.length < 6) return Alert.alert('Mot de passe trop court', 'Minimum 6 caractères.');
    if (password !== copassword) return Alert.alert('Mots de passe différents', 'Les mots de passe ne correspondent pas.');

    // Vérification checkbox obligatoire
    if (!acceptePolitique) {
      animerShake();
      Alert.alert(
        'Acceptation requise',
        'Vous devez lire et accepter la politique de confidentialité pour créer votre compte.'
      );
      return;
    }

    setLoading(true);
    try {
      const data = await inscription({ nom, prenom, adresse, telephone, password, copassword });
      if (data.status === 'success') {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirPolitique = () => {
    Linking.openURL(URL_POLITIQUE).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir la page. Vérifiez votre connexion internet.');
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Modal quartiers */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un quartier</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setRecherche(''); }}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={18} color="#aaa" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor="#bbb"
                value={recherche}
                onChangeText={setRecherche}
                autoCorrect={false}
              />
            </View>
            <ScrollView>
              {['1', '2', '3'].map(arr => {
                const liste = quartiersFiltres.filter(q => q.arr === arr);
                if (liste.length === 0) return null;
                return (
                  <View key={arr}>
                    <Text style={styles.arrLabel}>Ngaoundéré {arr}</Text>
                    {liste.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.quartierItem, adresse === item.value && styles.quartierItemSelected]}
                        onPress={() => { setAdresse(item.value); setModalVisible(false); setRecherche(''); }}
                      >
                        <Ionicons
                          name={adresse === item.value ? 'radio-button-on' : 'radio-button-off'}
                          size={18} color={adresse === item.value ? '#FF6B35' : '#ccc'}
                        />
                        <Text style={[styles.quartierText, adresse === item.value && styles.quartierTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/logo.jpg')} style={styles.logoImg} />
            </View>
            <Text style={styles.brandName}>Cycy-Food</Text>
          </View>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            {ETAPES.map((_, i) => (
              <View key={i} style={styles.progressStep}>
                <View style={[
                  styles.progressDot,
                  i <= etape && styles.progressDotActive,
                  i < etape && styles.progressDotDone,
                ]}>
                  {i < etape
                    ? <Ionicons name="checkmark" size={13} color="#FF6B35" />
                    : <Text style={[styles.progressNum, i === etape && styles.progressNumActive]}>{i + 1}</Text>
                  }
                </View>
                {i < ETAPES.length - 1 && (
                  <View style={[styles.progressLine, i < etape && styles.progressLineDone]} />
                )}
              </View>
            ))}
          </View>

          {/* Card animée */}
          <Animated.View style={[styles.card, { transform: [{ translateX: slideAnim }] }]}>

            {/* En-tête étape */}
            <View style={styles.etapeHeader}>
              <View style={styles.etapeIconWrap}>
                <Ionicons name={ETAPES[etape].icon} size={22} color="#FF6B35" />
              </View>
              <View>
                <Text style={styles.etapeSous}>{ETAPES[etape].sous}</Text>
                <Text style={styles.etapeTitre}>{ETAPES[etape].titre}</Text>
              </View>
            </View>

            {/* ÉTAPE 1 - Nom + Prénom */}
            {etape === 0 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre nom de famille"
                      placeholderTextColor="#bbb"
                      value={nom}
                      onChangeText={setNom}
                      autoCorrect={false}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-circle-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre prénom"
                      placeholderTextColor="#bbb"
                      value={prenom}
                      onChangeText={setPrenom}
                      autoCorrect={false}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            )}

            {/* ÉTAPE 2 - Quartier + Téléphone */}
            {etape === 1 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quartier</Text>
                  <TouchableOpacity style={styles.inputWrapper} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
                    <Ionicons name="location-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <Text style={[styles.selectText, !adresse && styles.selectPlaceholder]}>
                      {adresse || 'Sélectionner votre quartier'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#aaa" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 699887766"
                      placeholderTextColor="#bbb"
                      keyboardType="phone-pad"
                      maxLength={9}
                      value={telephone}
                      onChangeText={setTelephone}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </>
            )}

            {/* ÉTAPE 3 - Mots de passe + Checkbox politique */}
            {etape === 2 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="Min. 6 caractères"
                      placeholderTextColor="#bbb"
                      secureTextEntry={!showPass}
                      value={password}
                      onChangeText={setPassword}
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputFlex}
                      placeholder="Répétez le mot de passe"
                      placeholderTextColor="#bbb"
                      secureTextEntry={!showCoPass}
                      value={copassword}
                      onChangeText={setCopassword}
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowCoPass(!showCoPass)} style={styles.eyeBtn}>
                      <Ionicons name={showCoPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── CHECKBOX POLITIQUE ── */}
                <Animated.View style={[
                  styles.checkboxContainer,
                  !acceptePolitique && styles.checkboxContainerError,
                  { transform: [{ translateX: shakeAnim }] }
                ]}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAcceptePolitique(!acceptePolitique)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, acceptePolitique && styles.checkboxChecked]}>
                      {acceptePolitique && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </View>
                    <View style={styles.checkboxTextWrap}>
                      <Text style={styles.checkboxText}>
                        J'ai lu et j'accepte la{' '}
                        <Text
                          style={styles.checkboxLink}
                          onPress={ouvrirPolitique}
                        >
                          politique de confidentialité
                        </Text>
                        {' '}de Cycy-Food.
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Bouton lire la politique */}
                  <TouchableOpacity style={styles.lirePolitiqueBtn} onPress={ouvrirPolitique}>
                    <Ionicons name="open-outline" size={13} color="#FF6B35" />
                    <Text style={styles.lirePolitiqueBtnText}>Lire la politique</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* Navigation */}
            <View style={styles.navRow}>
              {etape > 0 && (
                <TouchableOpacity style={styles.btnRetour} onPress={retour}>
                  <Ionicons name="arrow-back" size={18} color="#FF6B35" />
                  <Text style={styles.btnRetourText}>Retour</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.btnSuivant,
                  etape === 0 && { flex: 1 },
                  etape === 2 && !acceptePolitique && styles.btnSuivantDisabled,
                ]}
                onPress={etape < 2 ? validerEtape : handleInscription}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Text style={styles.btnSuivantText}>
                        {etape < 2 ? 'Continuer' : 'Créer mon compte'}
                      </Text>
                      {etape < 2 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                    </>
                }
              </TouchableOpacity>
            </View>

            <View style={styles.linkRow}>
              <Text style={styles.linkText}>Déjà un compte ? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Se connecter</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 },

  header: { alignItems: 'center', marginBottom: 20 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 10 },
  logoImg: { width: 70, height: 70, resizeMode: 'cover' },
  brandName: { fontSize: 26, fontWeight: '800', color: '#fff' },

  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: '#fff' },
  progressDotDone: { backgroundColor: '#fff' },
  progressNum: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  progressNumActive: { color: '#FF6B35' },
  progressLine: { width: 44, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  progressLineDone: { backgroundColor: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  etapeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  etapeIconWrap: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#FF6B3510', alignItems: 'center', justifyContent: 'center' },
  etapeSous: { fontSize: 11, color: '#FF6B35', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  etapeTitre: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },

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
  selectText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  selectPlaceholder: { color: '#bbb' },

  // Checkbox politique
  checkboxContainer: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 14,
    padding: 14, backgroundColor: '#fafafa', marginBottom: 4,
  },
  checkboxContainerError: {
    borderColor: '#FF6B3540', backgroundColor: '#FF6B3506',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  checkboxTextWrap: { flex: 1 },
  checkboxText: { fontSize: 13, color: '#555', lineHeight: 20 },
  checkboxLink: { color: '#FF6B35', fontWeight: '700', textDecorationLine: 'underline' },
  lirePolitiqueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 10, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: '#FF6B3510', borderRadius: 20,
  },
  lirePolitiqueBtnText: { fontSize: 12, color: '#FF6B35', fontWeight: '700' },

  navRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnRetour: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#FF6B35', borderRadius: 14,
    height: 52, paddingHorizontal: 16,
  },
  btnRetourText: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
  btnSuivant: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FF6B35', borderRadius: 14, height: 52,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnSuivantDisabled: { backgroundColor: '#ccc', shadowOpacity: 0, elevation: 0 },
  btnSuivantText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkText: { color: '#888', fontSize: 14 },
  link: { color: '#FF6B35', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 12, margin: 16, backgroundColor: '#fafafa', height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', marginLeft: 8 },
  arrLabel: { fontSize: 11, fontWeight: '800', color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#FF6B3508' },
  quartierItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  quartierItemSelected: { backgroundColor: '#FF6B3506' },
  quartierText: { fontSize: 14, color: '#333', flex: 1 },
  quartierTextSelected: { color: '#FF6B35', fontWeight: '700' },
});
