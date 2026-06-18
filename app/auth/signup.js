// app/auth/signup.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, StatusBar,
  Dimensions, Modal, Animated,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { height } = Dimensions.get('window');

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

// ── Étape indicateur ─────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={si.stepWrap}>
          <View style={[si.dot, i < current && si.dotDone, i === current && si.dotActive]}>
            {i < current
              ? <Ionicons name="checkmark" size={10} color="#fff" />
              : <Text style={[si.dotNum, i === current && si.dotNumActive]}>{i + 1}</Text>
            }
          </View>
          {i < total - 1 && (
            <View style={[si.line, i < current && si.lineDone]} />
          )}
        </View>
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: COLORS.success },
  dotActive: { backgroundColor: COLORS.primary },
  dotNum: { fontSize: 12, fontWeight: '800', color: COLORS.text.disabled },
  dotNumActive: { color: '#fff' },
  line: { width: 32, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  lineDone: { backgroundColor: COLORS.success },
});

// ── Champ de saisie ──────────────────────────────────────
function Field({ label, icon, error, hint, ...props }) {
  return (
    <View style={f.group}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.row, error && f.rowError, props.value && !error && f.rowOk]}>
        <Ionicons name={icon} size={18} color={COLORS.primary} style={f.icon} />
        {props.inputEl ? props.inputEl : <TextInput style={f.input} placeholderTextColor={COLORS.text.disabled} {...props} />}
      </View>
      {error ? <Text style={f.errorTxt}>{error}</Text>
             : hint ? <Text style={f.hintTxt}>{hint}</Text> : null}
    </View>
  );
}

const f = StyleSheet.create({
  group: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingRight: SPACING.md, height: 54,
  },
  rowError: { borderColor: COLORS.error, backgroundColor: COLORS.error + '06' },
  rowOk: { borderColor: COLORS.success + '80' },
  icon: { marginHorizontal: SPACING.md },
  input: { flex: 1, fontSize: 15, color: COLORS.text.primary, height: 54 },
  errorTxt: { fontSize: 11, color: COLORS.error, marginTop: 4 },
  hintTxt: { fontSize: 11, color: COLORS.text.disabled, marginTop: 4 },
});

export default function SignupScreen() {
  const router = useRouter();
  const { inscription } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Étape 1
  const [nom, setNom]         = useState('');
  const [prenom, setPrenom]   = useState('');

  // Étape 2
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse]     = useState('');
  const [modalQ, setModalQ]       = useState(false);
  const [recherche, setRecherche] = useState('');

  // Étape 3
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (dir) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: dir * -30, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    // Validation par étape
    if (step === 0) {
      if (!nom.trim() || !prenom.trim()) {
        showAlert({ title: 'Champs requis', message: 'Veuillez renseigner votre nom et prénom.', type: 'warning' });
        return;
      }
    } else if (step === 1) {
      if (telephone.length !== 9) {
        showAlert({ title: 'Téléphone invalide', message: 'Le numéro doit contenir exactement 9 chiffres.', type: 'error' });
        return;
      }
      if (!adresse) {
        showAlert({ title: 'Quartier requis', message: 'Veuillez sélectionner votre quartier.', type: 'warning' });
        return;
      }
    }
    animateStep(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) { router.back(); return; }
    animateStep(-1);
    setStep(s => s - 1);
  };

  const handleInscription = async () => {
    if (!password || password.length < 6) {
      showAlert({ title: 'Mot de passe trop court', message: 'Au moins 6 caractères requis.', type: 'warning' });
      return;
    }
    if (password !== confirm) {
      showAlert({ title: 'Mots de passe différents', message: 'Les deux mots de passe doivent correspondre.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const data = await inscription({ nom, prenom, telephone, adresse, password });
      if (data.status === 'success') {
        showAlert({
          title: '🎉 Bienvenue !',
          message: `Votre compte a été créé. Bonne commande, ${prenom} !`,
          type: 'success',
          onConfirm: () => router.replace('/(tabs)'),
        });
      } else {
        showAlert({ title: 'Erreur', message: data.message || 'Inscription échouée.', type: 'error' });
      }
    } catch {
      showAlert({ title: 'Connexion impossible', message: 'Vérifiez votre connexion internet.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const forceLevel = password.length < 4 ? 0 : password.length < 6 ? 1 : password.length < 9 ? 2 : 3;
  const forceColors = ['#EEE', COLORS.error, COLORS.warning, COLORS.success];
  const forceLabels = ['', 'Faible', 'Moyen', 'Fort'];

  const quartiersF = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Fond */}
      <View style={s.bgTop} />
      <View style={s.bgBottom} />

      {/* Modal quartier */}
      <Modal visible={modalQ} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.handle} />
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>Choisir un quartier</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => { setModalQ(false); setRecherche(''); }}>
                <Ionicons name="close" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={16} color={COLORS.text.disabled} />
              <TextInput
                style={s.searchInput}
                placeholder="Rechercher…"
                placeholderTextColor={COLORS.text.disabled}
                value={recherche}
                onChangeText={setRecherche}
              />
              {recherche.length > 0 && (
                <TouchableOpacity onPress={() => setRecherche('')}>
                  <Ionicons name="close-circle" size={16} color={COLORS.text.disabled} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {['1', '2', '3'].map(arr => {
                const liste = quartiersF.filter(q => q.arr === arr);
                if (!liste.length) return null;
                return (
                  <View key={arr}>
                    <View style={s.arrHeader}>
                      <Text style={s.arrLabel}>Ngaoundéré {arr}</Text>
                    </View>
                    {liste.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[s.quartierRow, adresse === item.value && s.quartierRowActive]}
                        onPress={() => { setAdresse(item.value); setModalQ(false); setRecherche(''); }}
                      >
                        <Ionicons
                          name={adresse === item.value ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={adresse === item.value ? COLORS.primary : COLORS.text.disabled}
                        />
                        <Text style={[s.quartierLabel, adresse === item.value && s.quartierLabelActive]}>
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={s.brandArea}>
            <Text style={s.brandName}>LaTchop</Text>
            <Text style={s.brandSub}>Créer votre compte</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <StepIndicator current={step} total={3} />

            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>

              {/* ── Étape 0 : Identité ────────────────── */}
              {step === 0 && (
                <View>
                  <Text style={s.stepTitle}>Qui êtes-vous ?</Text>
                  <Text style={s.stepSub}>Votre nom et prénom pour personnaliser votre expérience.</Text>
                  <Field
                    label="Nom de famille"
                    icon="person-outline"
                    placeholder="Votre nom"
                    value={nom}
                    onChangeText={setNom}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <Field
                    label="Prénom"
                    icon="person-circle-outline"
                    placeholder="Votre prénom"
                    value={prenom}
                    onChangeText={setPrenom}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* ── Étape 1 : Contact & Adresse ───────── */}
              {step === 1 && (
                <View>
                  <Text style={s.stepTitle}>Coordonnées</Text>
                  <Text style={s.stepSub}>Votre numéro et quartier pour la livraison.</Text>
                  <Field
                    label="Numéro de téléphone"
                    icon="call-outline"
                    placeholder="Ex: 699 887 766"
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                    maxLength={9}
                    hint={telephone.length > 0 ? `${telephone.length}/9 chiffres` : undefined}
                    error={telephone.length > 0 && telephone.length !== 9 ? 'Le numéro doit contenir 9 chiffres' : undefined}
                  />
                  <Field
                    label="Quartier"
                    icon="location-outline"
                    inputEl={
                      <TouchableOpacity style={f.input} onPress={() => setModalQ(true)}>
                        <Text style={[{ fontSize: 15 }, !adresse && { color: COLORS.text.disabled }]}>
                          {adresse || 'Sélectionner votre quartier'}
                        </Text>
                      </TouchableOpacity>
                    }
                    value={adresse}
                  />
                </View>
              )}

              {/* ── Étape 2 : Sécurité ────────────────── */}
              {step === 2 && (
                <View>
                  <Text style={s.stepTitle}>Sécurité</Text>
                  <Text style={s.stepSub}>Choisissez un mot de passe fort pour protéger votre compte.</Text>

                  {/* Mot de passe */}
                  <View style={f.group}>
                    <Text style={f.label}>Mot de passe</Text>
                    <View style={[f.row, password.length > 0 && f.rowOk]}>
                      <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={f.icon} />
                      <TextInput
                        style={f.input}
                        placeholder="Min. 6 caractères"
                        placeholderTextColor={COLORS.text.disabled}
                        secureTextEntry={!showPass}
                        value={password}
                        onChangeText={setPassword}
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 8 }}>
                        <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.text.disabled} />
                      </TouchableOpacity>
                    </View>
                    {password.length > 0 && (
                      <View style={s.forceRow}>
                        {[1, 2, 3].map(i => (
                          <View key={i} style={[s.forceBarre, { backgroundColor: i <= forceLevel ? forceColors[forceLevel] : '#EEE' }]} />
                        ))}
                        {forceLevel > 0 && (
                          <Text style={[s.forceLabel, { color: forceColors[forceLevel] }]}>{forceLabels[forceLevel]}</Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Confirmer */}
                  <View style={f.group}>
                    <Text style={f.label}>Confirmer le mot de passe</Text>
                    <View style={[
                      f.row,
                      confirm.length > 0 && password !== confirm && f.rowError,
                      confirm.length > 0 && password === confirm && f.rowOk,
                    ]}>
                      <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} style={f.icon} />
                      <TextInput
                        style={f.input}
                        placeholder="Répétez le mot de passe"
                        placeholderTextColor={COLORS.text.disabled}
                        secureTextEntry={!showConf}
                        value={confirm}
                        onChangeText={setConfirm}
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowConf(!showConf)} style={{ padding: 8 }}>
                        <Ionicons name={showConf ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.text.disabled} />
                      </TouchableOpacity>
                    </View>
                    {confirm.length > 0 && password !== confirm && (
                      <Text style={f.errorTxt}>Les mots de passe ne correspondent pas</Text>
                    )}
                    {confirm.length > 0 && password === confirm && (
                      <Text style={{ fontSize: 11, color: COLORS.success, marginTop: 4, fontWeight: '600' }}>
                        ✓ Mots de passe identiques
                      </Text>
                    )}
                  </View>

                  {/* Récap */}
                  <View style={s.recap}>
                    <View style={s.recapRow}>
                      <Ionicons name="person" size={14} color={COLORS.primary} />
                      <Text style={s.recapText}>{prenom} {nom}</Text>
                    </View>
                    <View style={s.recapRow}>
                      <Ionicons name="call" size={14} color={COLORS.primary} />
                      <Text style={s.recapText}>{telephone}</Text>
                    </View>
                    <View style={s.recapRow}>
                      <Ionicons name="location" size={14} color={COLORS.primary} />
                      <Text style={s.recapText}>{adresse}</Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Navigation */}
            <View style={s.navRow}>
              <TouchableOpacity style={s.btnBack} onPress={goBack}>
                <Ionicons name="arrow-back" size={18} color={COLORS.text.secondary} />
                <Text style={s.btnBackText}>{step === 0 ? 'Connexion' : 'Retour'}</Text>
              </TouchableOpacity>

              {step < 2 ? (
                <TouchableOpacity style={s.btnNext} onPress={goNext}>
                  <Text style={s.btnNextText}>Suivant</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.btnNext, loading && { opacity: 0.7 }]}
                  onPress={handleInscription}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : (
                      <>
                        <Text style={s.btnNextText}>Créer le compte</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      </>
                    )
                  }
                </TouchableOpacity>
              )}
            </View>

            {step === 0 && (
              <View style={s.loginRow}>
                <Text style={s.loginText}>Déjà un compte ? </Text>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity>
                    <Text style={s.loginLink}>Se connecter</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  bgTop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.primary },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: height * 0.65,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
  },

  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40 },

  brandArea: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: SPACING.xl,
  },
  brandName: {
    fontSize: 36, fontWeight: '900', color: '#fff',
    letterSpacing: -1, marginBottom: 4,
  },
  brandSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    ...SHADOWS.heavy,
  },

  stepTitle: {
    fontSize: 22, fontWeight: '900', color: COLORS.text.primary,
    marginBottom: 4, letterSpacing: -0.3,
  },
  stepSub: {
    fontSize: 13, color: COLORS.text.secondary,
    marginBottom: SPACING.lg, lineHeight: 19,
  },

  forceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  forceBarre: { flex: 1, height: 4, borderRadius: 2 },
  forceLabel: { fontSize: 11, fontWeight: '700', marginLeft: 4, minWidth: 40 },

  recap: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary + '20',
    gap: 6, marginTop: SPACING.sm,
  },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recapText: { fontSize: 13, color: COLORS.text.primary, fontWeight: '600' },

  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.xl, gap: SPACING.sm,
  },
  btnBack: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 50,
    borderWidth: 1, borderColor: COLORS.border,
  },
  btnBackText: { fontSize: 14, fontWeight: '700', color: COLORS.text.secondary },
  btnNext: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 50,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnNextText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  loginRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: SPACING.lg,
  },
  loginText: { fontSize: 14, color: COLORS.text.secondary },
  loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%', paddingBottom: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    margin: SPACING.md, backgroundColor: COLORS.background, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text.primary },
  arrHeader: {
    paddingHorizontal: SPACING.lg, paddingVertical: 8,
    backgroundColor: COLORS.primary + '0A',
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  arrLabel: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  quartierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  quartierRowActive: { backgroundColor: COLORS.primary + '08' },
  quartierLabel: { flex: 1, fontSize: 15, color: COLORS.text.secondary },
  quartierLabelActive: { color: COLORS.primary, fontWeight: '700' },
});
