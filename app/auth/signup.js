// app/auth/signup.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Modal, Animated, Dimensions, Linking, Image, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
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
  const { showAlert } = useAlert();
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
  const [focused, setFocused] = useState(null);

  const prenomRef = useRef(null);
  const telRef = useRef(null);
  const passRef = useRef(null);
  const copassRef = useRef(null);

  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(cardOp, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const animer = (direction) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -30 : 30,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  };

  const quartiersFiltres = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  const validerEtape = () => {
    Keyboard.dismiss();
    
    if (etape === 0) {
      if (!nom.trim()) return showAlert({ title: 'Champ requis', message: 'Veuillez entrer votre nom.', type: 'warning' });
      if (!prenom.trim()) return showAlert({ title: 'Champ requis', message: 'Veuillez entrer votre prénom.', type: 'warning' });
    }
    if (etape === 1) {
      if (!adresse) return showAlert({ title: 'Champ requis', message: 'Veuillez choisir votre quartier.', type: 'warning' });
      if (!telephone || telephone.length !== 9) return showAlert({ title: 'Téléphone invalide', message: 'Le numéro doit contenir 9 chiffres.', type: 'error' });
    }
    
    animer('next');
    setEtape(e => e + 1);
  };

  const retour = () => {
    animer('back');
    setEtape(e => e - 1);
  };

  const handleInscription = async () => {
    Keyboard.dismiss();
    
    if (password.length < 6) return showAlert({ title: 'Mot de passe trop court', message: 'Minimum 6 caractères.', type: 'warning' });
    if (password !== copassword) return showAlert({ title: 'Mots de passe différents', message: 'Les mots de passe ne correspondent pas.', type: 'error' });
    if (!acceptePolitique) {
      animerShake();
      return;
    }

    setLoading(true);
    try {
      const data = await inscription({ nom, prenom, adresse, telephone, password, copassword });
      if (data.status === 'success') {
        showAlert({
          title: '🎉 Bienvenue !',
          message: 'Votre compte a été créé avec succès.',
          type: 'success',
          onConfirm: () => router.replace('/(tabs)'),
        });
      } else {
        showAlert({ title: 'Erreur', message: data.message || 'Inscription échouée.', type: 'error' });
      }
    } catch (e) {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de contacter le serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const ouvrirPolitique = () => {
    Linking.openURL(URL_POLITIQUE).catch(() => {
      showAlert({ title: 'Erreur', message: "Impossible d'ouvrir la page. Vérifiez votre connexion internet.", type: 'error' });
    });
  };

  const forceLevel = password.length < 4 ? 0 : password.length < 6 ? 1 : password.length < 9 ? 2 : 3;
  const forceColors = ['#EEE', COLORS.error, COLORS.warning, COLORS.success];
  const forceLabels = ['', 'Faible', 'Moyen', 'Fort'];

  const telephoneValide = telephone.length === 9;
  const telephoneInvalide = telephone.length > 0 && telephone.length !== 9;
  const passwordsMatch = copassword.length > 0 && password === copassword;
  const passwordsDiffer = copassword.length > 0 && password !== copassword;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      {/* ── Fond dégradé avec formes déco ── */}
      <View style={styles.bg} pointerEvents="none">
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgWave} />
      </View>

      {/* MODAL QUARTIERS */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un quartier</Text>
              <TouchableOpacity 
                onPress={() => { setModalVisible(false); setRecherche(''); }} 
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={18} color={COLORS.text.disabled} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor={COLORS.text.disabled}
                value={recherche}
                onChangeText={setRecherche}
                autoCorrect={false}
                autoFocus
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {['1', '2', '3'].map(arr => {
                const liste = quartiersFiltres.filter(q => q.arr === arr);
                if (liste.length === 0) return null;
                return (
                  <View key={arr}>
                    <View style={styles.arrHeader}>
                      <Text style={styles.arrLabel}>Ngaoundéré {arr}</Text>
                    </View>
                    {liste.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.quartierItem, adresse === item.value && styles.quartierItemSelected]}
                        onPress={() => { setAdresse(item.value); setModalVisible(false); setRecherche(''); }}
                      >
                        <Ionicons
                          name={adresse === item.value ? 'radio-button-on' : 'radio-button-off'}
                          size={18} color={adresse === item.value ? COLORS.primary : COLORS.text.disabled}
                        />
                        <Text style={[styles.quartierText, adresse === item.value && styles.quartierTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CLAVIER FLUIDE AVEC DÉCALAGE */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* HEADER BRANDING */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* PROGRESS BARS */}
        <View style={styles.progressContainer}>
          {ETAPES.map((_, i) => (
            <View key={i} style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                i <= etape && styles.progressDotActive,
              ]}>
                {i < etape ? (
                  <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                ) : (
                  <Text style={[styles.progressNum, i === etape && styles.progressNumActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < ETAPES.length - 1 && (
                <View style={[styles.progressLine, i < etape && styles.progressLineDone]} />
              )}
            </View>
          ))}
        </View>

        {/* SCROLL UNIQUEMENT SUR LA CARTE */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
            <Animated.View style={[styles.card, {
              opacity: cardOp,
              transform: [
                { translateY: cardAnim },
                { translateX: slideAnim },
                { scale: scaleAnim }
              ],
            }]}>
              
              {/* EN-TÊTE DE L'ÉTAPE */}
              <View style={styles.etapeHeader}>
                <View style={styles.etapeIconWrap}>
                  <Ionicons name={ETAPES[etape].icon} size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.etapeSous}>{ETAPES[etape].sous}</Text>
                  <Text style={styles.etapeTitre}>{ETAPES[etape].titre}</Text>
                </View>
              </View>

              {/* CONTENU DU FORMULAIRE */}
              <View style={styles.formContent}>
                
                {/* ÉTAPE 1 - Nom & Prénom */}
                {etape === 0 && (
                  <View style={styles.stepBlock}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Nom</Text>
                      <View style={[
                        styles.fieldRow,
                        focused === 'nom' && styles.fieldRowFocused,
                        nom.trim().length > 0 && focused !== 'nom' && styles.rowOk
                      ]}>
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'nom' ? "person" : "person-outline"} 
                            size={20} 
                            color={focused === 'nom' ? COLORS.primary : COLORS.text.disabled} 
                          />
                        </View>
                        <TextInput
                          style={styles.fieldInput}
                          placeholder="Votre nom de famille"
                          placeholderTextColor={COLORS.text.disabled}
                          value={nom}
                          onChangeText={setNom}
                          onFocus={() => setFocused('nom')}
                          onBlur={() => setFocused(null)}
                          onSubmitEditing={() => prenomRef.current?.focus()}
                          returnKeyType="next"
                          autoCorrect={false}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Prénom</Text>
                      <View style={[
                        styles.fieldRow,
                        focused === 'prenom' && styles.fieldRowFocused,
                        prenom.trim().length > 0 && focused !== 'prenom' && styles.rowOk
                      ]}>
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'prenom' ? "person-circle" : "person-circle-outline"} 
                            size={20} 
                            color={focused === 'prenom' ? COLORS.primary : COLORS.text.disabled} 
                          />
                        </View>
                        <TextInput
                          ref={prenomRef}
                          style={styles.fieldInput}
                          placeholder="Votre prénom"
                          placeholderTextColor={COLORS.text.disabled}
                          value={prenom}
                          onChangeText={setPrenom}
                          onFocus={() => setFocused('prenom')}
                          onBlur={() => setFocused(null)}
                          onSubmitEditing={validerEtape}
                          returnKeyType="next"
                          autoCorrect={false}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* ÉTAPE 2 - Quartier & Téléphone */}
                {etape === 1 && (
                  <View style={styles.stepBlock}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Quartier</Text>
                      <TouchableOpacity 
                        style={[
                          styles.fieldRow,
                          focused === 'adresse' && styles.fieldRowFocused,
                          adresse ? styles.rowOk : null
                        ]} 
                        onPress={() => {
                          setFocused('adresse');
                          setModalVisible(true);
                        }} 
                        activeOpacity={0.7}
                      >
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'adresse' || adresse ? "location" : "location-outline"} 
                            size={20} 
                            color={focused === 'adresse' || adresse ? COLORS.primary : COLORS.text.disabled} 
                          />
                        </View>
                        <Text style={[styles.selectText, !adresse && styles.selectPlaceholder]}>
                          {adresse || 'Sélectionner votre quartier'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={COLORS.text.disabled} style={{ marginRight: SPACING.xs }} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
                      <View style={[
                        styles.fieldRow,
                        focused === 'tel' && styles.fieldRowFocused,
                        telephoneInvalide && styles.rowError,
                        telephoneValide && focused !== 'tel' && styles.rowOk,
                      ]}>
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'tel' ? "call" : "call-outline"} 
                            size={20} 
                            color={
                              telephoneInvalide ? COLORS.error :
                              telephoneValide ? COLORS.success :
                              focused === 'tel' ? COLORS.primary : COLORS.text.disabled
                            } 
                          />
                        </View>
                        <TextInput
                          ref={telRef}
                          style={styles.fieldInput}
                          placeholder="Ex: 699 887 766"
                          placeholderTextColor={COLORS.text.disabled}
                          keyboardType="phone-pad"
                          maxLength={9}
                          value={telephone}
                          onChangeText={setTelephone}
                          onFocus={() => setFocused('tel')}
                          onBlur={() => setFocused(null)}
                          onSubmitEditing={validerEtape}
                          returnKeyType="next"
                          autoCorrect={false}
                        />
                      </View>
                      {telephone.length > 0 && (
                        <Text style={[
                          styles.validationHint,
                          telephoneValide ? styles.textSuccess : styles.textError
                        ]}>
                          {telephoneValide ? '✓ Numéro valide (9 chiffres)' : `${telephone.length}/9 chiffres saisis`}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* ÉTAPE 3 - Sécurité & Politique */}
                {etape === 2 && (
                  <View style={styles.stepBlock}>
                    {/* Mot de passe */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Mot de passe</Text>
                      <View style={[
                        styles.fieldRow,
                        focused === 'pass' && styles.fieldRowFocused,
                        password.length > 0 && focused !== 'pass' && styles.rowOk
                      ]}>
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'pass' ? "lock-closed" : "lock-closed-outline"} 
                            size={20} 
                            color={focused === 'pass' ? COLORS.primary : COLORS.text.disabled} 
                          />
                        </View>
                        <TextInput
                          ref={passRef}
                          style={styles.fieldInput}
                          placeholder="Min. 6 caractères"
                          placeholderTextColor={COLORS.text.disabled}
                          secureTextEntry={!showPass}
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setFocused('pass')}
                          onBlur={() => setFocused(null)}
                          onSubmitEditing={() => copassRef.current?.focus()}
                          returnKeyType="next"
                          autoCorrect={false}
                        />
                        <TouchableOpacity 
                          onPress={() => setShowPass(!showPass)} 
                          style={styles.eyeBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons 
                            name={showPass ? 'eye-off-outline' : 'eye-outline'} 
                            size={20} 
                            color={COLORS.text.disabled} 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Barre d'indicateur visuel de force */}
                      {password.length > 0 && (
                        <View style={styles.forceRow}>
                          {[1, 2, 3].map(i => (
                            <View 
                              key={i} 
                              style={[
                                styles.forceBarre, 
                                { backgroundColor: i <= forceLevel ? forceColors[forceLevel] : '#EEE' }
                              ]} 
                            />
                          ))}
                          {forceLevel > 0 && (
                            <Text style={[styles.forceLabel, { color: forceColors[forceLevel] }]}>
                              {forceLabels[forceLevel]}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Confirmation */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
                      <View style={[
                        styles.fieldRow,
                        focused === 'copass' && styles.fieldRowFocused,
                        passwordsDiffer && styles.rowError,
                        passwordsMatch && focused !== 'copass' && styles.rowOk,
                      ]}>
                        <View style={styles.fieldIconWrap}>
                          <Ionicons 
                            name={focused === 'copass' ? "shield-checkmark" : "shield-checkmark-outline"} 
                            size={20} 
                            color={
                              passwordsDiffer ? COLORS.error :
                              passwordsMatch ? COLORS.success :
                              focused === 'copass' ? COLORS.primary : COLORS.text.disabled
                            } 
                          />
                        </View>
                        <TextInput
                          ref={copassRef}
                          style={styles.fieldInput}
                          placeholder="Répétez le mot de passe"
                          placeholderTextColor={COLORS.text.disabled}
                          secureTextEntry={!showCoPass}
                          value={copassword}
                          onChangeText={setCopassword}
                          onFocus={() => setFocused('copass')}
                          onBlur={() => setFocused(null)}
                          onSubmitEditing={handleInscription}
                          returnKeyType="done"
                          autoCorrect={false}
                        />
                        <TouchableOpacity 
                          onPress={() => setShowCoPass(!showCoPass)} 
                          style={styles.eyeBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons 
                            name={showCoPass ? 'eye-off-outline' : 'eye-outline'} 
                            size={20} 
                            color={COLORS.text.disabled} 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Message de confirmation de mot de passe */}
                      {copassword.length > 0 && (
                        <Text style={[
                          styles.validationHint,
                          passwordsMatch ? styles.textSuccess : styles.textError
                        ]}>
                          {passwordsMatch ? '✓ Mots de passe identiques' : '✗ Les mots de passe ne correspondent pas'}
                        </Text>
                      )}
                    </View>

                    {/* CHECKBOX POLITIQUE */}
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
                          {acceptePolitique && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <View style={styles.checkboxTextWrap}>
                          <Text style={styles.checkboxText}>
                            J'ai lu et j'accepte la{' '}
                            <Text style={styles.checkboxLink} onPress={ouvrirPolitique}>
                              politique de confidentialité
                            </Text>
                            {' '}de LaTchop.
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}
              </View>

              {/* NAVIGATION BOUTONS */}
              <View style={styles.navRow}>
                {etape > 0 && (
                  <TouchableOpacity style={styles.btnRetour} onPress={retour}>
                    <Ionicons name="arrow-back" size={18} color={COLORS.text.secondary} />
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
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.btnSuivantText}>
                        {etape < 2 ? 'Continuer' : 'Créer mon compte'}
                      </Text>
                      {etape < 2 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* LIEN CONNEXION */}
              {etape === 0 && (
                <View style={styles.linkRow}>
                  <Text style={styles.linkText}>Déjà un compte ? </Text>
                  <Link href="/auth/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.link}>Se connecter</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}

            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  
  // ── Fond dégradé ──
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
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  
  // Branding
  header: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.xs,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    padding: 0,
  },
  logoImg: { width: '100%', height: '100%' },
  
  // Progress Bar
  progressContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: SPACING.lg 
  },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: '#fff' },
  progressNum: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  progressNumActive: { color: COLORS.primary },
  progressLine: { width: 50, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  progressLineDone: { backgroundColor: '#fff' },
  
  // Carte principale
  cardWrapper: { alignItems: 'center', width: '100%' },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.xl,
    minHeight: 440,
    ...SHADOWS.medium,
  },
  
  // En-tête d'étape
  etapeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  etapeIconWrap: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center'
  },
  etapeSous: { fontSize: 11, color: COLORS.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  etapeTitre: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: 2 },
  
  // Formulaire
  formContent: { flex: 1 },
  stepBlock: { gap: SPACING.md },
  
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
  
  rowError: { borderColor: COLORS.error, backgroundColor: COLORS.error + '06' },
  rowOk: { borderColor: COLORS.success + '80', backgroundColor: COLORS.success + '06' },
  selectText: { flex: 1, fontSize: 16, color: COLORS.text.primary },
  selectPlaceholder: { color: COLORS.text.disabled },
  
  validationHint: { fontSize: 11, marginTop: 4, fontWeight: '600', marginLeft: 4 },
  textSuccess: { color: COLORS.success },
  textError: { color: COLORS.error },
  
  forceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  forceBarre: { flex: 1, height: 4, borderRadius: 2 },
  forceLabel: { fontSize: 11, fontWeight: '700', marginLeft: 4, minWidth: 40 },
  
  checkboxContainer: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, backgroundColor: COLORS.background, marginTop: 4,
  },
  checkboxContainerError: { borderColor: COLORS.error + '50', backgroundColor: COLORS.error + '08' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.text.disabled,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTextWrap: { flex: 1 },
  checkboxText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  checkboxLink: { color: COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },
  
  navRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  btnRetour: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    height: 52, paddingHorizontal: SPACING.md,
  },
  btnRetourText: { color: COLORS.text.secondary, fontSize: 14, fontWeight: '700' },
  btnSuivant: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 52,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  btnSuivantDisabled: { backgroundColor: COLORS.text.disabled, shadowOpacity: 0, elevation: 0 },
  btnSuivantText: { color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  linkText: { color: COLORS.text.secondary, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { 
    backgroundColor: COLORS.surface, 
    borderTopLeftRadius: RADIUS.xl, 
    borderTopRightRadius: RADIUS.xl, 
    maxHeight: '80%', 
    paddingBottom: 30 
  },
  modalHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  closeBtn: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: COLORS.background, 
    alignItems: 'center', justifyContent: 'center' 
  },
  searchWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, 
    paddingHorizontal: SPACING.md, margin: SPACING.md, 
    backgroundColor: COLORS.background, height: 46 
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text.primary, marginLeft: 8 },
  arrHeader: { 
    paddingHorizontal: SPACING.lg, paddingVertical: 8, 
    backgroundColor: COLORS.primary + '0A', 
    borderLeftWidth: 3, borderLeftColor: COLORS.primary 
  },
  arrLabel: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  quartierItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    paddingHorizontal: SPACING.lg, paddingVertical: 14, 
    borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  quartierItemSelected: { backgroundColor: COLORS.primary + '08' },
  quartierText: { fontSize: 15, color: COLORS.text.secondary, flex: 1 },
  quartierTextSelected: { color: COLORS.primary, fontWeight: '700' },
});