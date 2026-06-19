// app/(tabs)/profil/modifier.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal, 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';
import { ENDPOINTS } from '../../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';

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

// ── Champ de saisie réutilisable ─────────────────────────
function InputField({ label, icon, error, success, ...props }) {
  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <View style={[
        s.inputWrap,
        error && s.inputWrapError,
        success && s.inputWrapSuccess,
      ]}>
        <Ionicons name={icon} size={18} color={COLORS.primary} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholderTextColor={COLORS.text.disabled}
          {...props}
        />
      </View>
    </View>
  );
}

export default function ModifierProfilScreen() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();
  const { showAlert } = useAlert();

  const [nom, setNom]           = useState(user?.nom_user || '');
  const [prenom, setPrenom]     = useState(user?.prenom_user || '');
  const [adresse, setAdresse]   = useState(user?.adresse_user || '');
  const [telephone, setTelephone] = useState(user?.telephone?.toString() || '');
  const [loading, setLoading]   = useState(false);

  const [modalQuartier, setModalQuartier] = useState(false);
  const [recherche, setRecherche] = useState('');

  const [modalPassword, setModalPassword] = useState(false);
  const [ancienMdp, setAncienMdp]   = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showAncien, setShowAncien]   = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingMdp, setLoadingMdp]   = useState(false);

  const quartiersFiltres = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  const handleSauvegarder = async () => {
    if (!nom.trim() || !prenom.trim())
      return showAlert({ title: 'Champs requis', message: 'Nom et prénom obligatoires.', type: 'error' });
    if (!adresse)
      return showAlert({ title: 'Quartier requis', message: 'Veuillez choisir votre quartier.', type: 'error' });
    if (!telephone || telephone.length !== 9)
      return showAlert({ title: 'Téléphone invalide', message: 'Le numéro doit contenir 9 chiffres.', type: 'error' });

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.profil, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nom, prenom, adresse, telephone }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (updateUser) updateUser(data.user);
        showAlert({
          title: 'Profil mis à jour',
          message: 'Vos informations ont bien été enregistrées.',
          type: 'success',
          onConfirm: () => router.back(),
        });
      } else {
        showAlert({ title: 'Erreur', message: data.message || 'Mise à jour échouée.', type: 'error' });
      }
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de contacter le serveur.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangerMdp = async () => {
    if (!ancienMdp)
      return showAlert({ title: 'Champ requis', message: 'Entrez votre ancien mot de passe.', type: 'error' });
    if (!nouveauMdp || nouveauMdp.length < 6)
      return showAlert({ title: 'Trop court', message: 'Au moins 6 caractères requis.', type: 'warning' });
    if (nouveauMdp !== confirmMdp)
      return showAlert({ title: 'Mots de passe différents', message: 'La confirmation ne correspond pas.', type: 'error' });
    if (ancienMdp === nouveauMdp)
      return showAlert({ title: 'Identique', message: 'Le nouveau mot de passe doit différer de l\'ancien.', type: 'warning' });

    setLoadingMdp(true);
    try {
      const res = await fetch(ENDPOINTS.changerMotDePasse, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fermerModalMdp();
        showAlert({ title: 'Mot de passe modifié', message: 'Votre mot de passe a bien été mis à jour.', type: 'success' });
      } else {
        showAlert({ title: 'Erreur', message: data.message || 'Modification échouée.', type: 'error' });
      }
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de contacter le serveur.', type: 'error' });
    } finally {
      setLoadingMdp(false);
    }
  };

  const fermerModalMdp = () => {
    setModalPassword(false);
    setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
    setShowAncien(false); setShowNouveau(false); setShowConfirm(false);
  };

  // Indicateur force du mot de passe
  const forceLevel = nouveauMdp.length < 4 ? 0 : nouveauMdp.length < 6 ? 1 : nouveauMdp.length < 9 ? 2 : 3;
  const forceColors = ['#EEE', COLORS.error, COLORS.warning, COLORS.success];
  const forceLabels = ['', 'Faible', 'Moyen', 'Fort'];

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      {/* ── Modal Quartier ─────────────────────────────── */}
      <Modal visible={modalQuartier} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <Text style={s.modalHeadTitle}>Choisir un quartier</Text>
              <TouchableOpacity
                style={s.modalCloseBtn}
                onPress={() => { setModalQuartier(false); setRecherche(''); }}
              >
                <Ionicons name="close" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={s.searchRow}>
              <Ionicons name="search-outline" size={17} color={COLORS.text.disabled} />
              <TextInput
                style={s.searchInput}
                placeholder="Rechercher un quartier…"
                placeholderTextColor={COLORS.text.disabled}
                value={recherche}
                onChangeText={setRecherche}
                autoCorrect={false}
              />
              {recherche.length > 0 && (
                <TouchableOpacity onPress={() => setRecherche('')}>
                  <Ionicons name="close-circle" size={16} color={COLORS.text.disabled} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {['1', '2', '3'].map(arr => {
                const liste = quartiersFiltres.filter(q => q.arr === arr);
                if (!liste.length) return null;
                return (
                  <View key={arr}>
                    <View style={s.arrRow}>
                      <Text style={s.arrLabel}>Ngaoundéré {arr}</Text>
                    </View>
                    {liste.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[s.quartierItem, adresse === item.value && s.quartierItemActive]}
                        onPress={() => { setAdresse(item.value); setModalQuartier(false); setRecherche(''); }}
                      >
                        <Ionicons
                          name={adresse === item.value ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={adresse === item.value ? COLORS.primary : COLORS.text.disabled}
                        />
                        <Text style={[s.quartierText, adresse === item.value && s.quartierTextActive]}>
                          {item.label}
                        </Text>
                        {adresse === item.value && (
                          <View style={s.selectedTag}>
                            <Text style={s.selectedTagText}>Sélectionné</Text>
                          </View>
                        )}
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

      {/* ── Modal Mot de passe ─────────────────────────── */}
      <Modal visible={modalPassword} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { maxHeight: '92%' }]}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <Text style={s.modalHeadTitle}>Changer le mot de passe</Text>
              <TouchableOpacity style={s.modalCloseBtn} onPress={fermerModalMdp}>
                <Ionicons name="close" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ padding: SPACING.lg }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
            >
              {/* Icône déco */}
              <View style={s.mdpIconWrap}>
                <View style={s.mdpIconCircle}>
                  <Ionicons name="lock-closed" size={30} color={COLORS.primary} />
                </View>
                <Text style={s.mdpSub}>Choisissez un mot de passe fort d'au moins 6 caractères.</Text>
              </View>

              {/* Ancien mdp */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Ancien mot de passe</Text>
                <View style={s.inputWrap}>
                  <Ionicons name="lock-open-outline" size={18} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="Votre mot de passe actuel"
                    placeholderTextColor={COLORS.text.disabled}
                    secureTextEntry={!showAncien}
                    value={ancienMdp}
                    onChangeText={setAncienMdp}
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowAncien(!showAncien)} style={s.eyeBtn}>
                    <Ionicons name={showAncien ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.text.disabled} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nouveau mdp */}
              <View style={s.inputGroup}>
                <Text style={s.label}>Nouveau mot de passe</Text>
                <View style={s.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="Min. 6 caractères"
                    placeholderTextColor={COLORS.text.disabled}
                    secureTextEntry={!showNouveau}
                    value={nouveauMdp}
                    onChangeText={setNouveauMdp}
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowNouveau(!showNouveau)} style={s.eyeBtn}>
                    <Ionicons name={showNouveau ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.text.disabled} />
                  </TouchableOpacity>
                </View>
                {nouveauMdp.length > 0 && (
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
              <View style={s.inputGroup}>
                <Text style={s.label}>Confirmer le nouveau mot de passe</Text>
                <View style={[
                  s.inputWrap,
                  confirmMdp.length > 0 && nouveauMdp !== confirmMdp && s.inputWrapError,
                  confirmMdp.length > 0 && nouveauMdp === confirmMdp && s.inputWrapSuccess,
                ]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="Répétez le nouveau mot de passe"
                    placeholderTextColor={COLORS.text.disabled}
                    secureTextEntry={!showConfirm}
                    value={confirmMdp}
                    onChangeText={setConfirmMdp}
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.text.disabled} />
                  </TouchableOpacity>
                </View>
                {confirmMdp.length > 0 && nouveauMdp !== confirmMdp && (
                  <Text style={s.feedbackError}>Les mots de passe ne correspondent pas</Text>
                )}
                {confirmMdp.length > 0 && nouveauMdp === confirmMdp && (
                  <Text style={s.feedbackSuccess}>✓ Mots de passe identiques</Text>
                )}
              </View>

              {/* Boutons */}
              <View style={s.mdpBtns}>
                <TouchableOpacity style={s.btnAnnuler} onPress={fermerModalMdp}>
                  <Text style={s.btnAnnulerText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnConfirmer, loadingMdp && { opacity: 0.7 }]}
                  onPress={handleChangerMdp}
                  disabled={loadingMdp}
                >
                  {loadingMdp ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={s.btnConfirmerText}>Confirmer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Contenu principal ──────────────────────────── */}
      <View style={s.content}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Modifier le profil</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <InputField
              label="Nom"
              icon="person-outline"
              placeholder="Votre nom de famille"
              value={nom}
              onChangeText={setNom}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <InputField
              label="Prénom"
              icon="person-circle-outline"
              placeholder="Votre prénom"
              value={prenom}
              onChangeText={setPrenom}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Quartier selector */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Quartier</Text>
              <TouchableOpacity style={s.inputWrap} onPress={() => setModalQuartier(true)} activeOpacity={0.7}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} style={s.inputIcon} />
                <Text style={[s.input, !adresse && { color: COLORS.text.disabled }]}>
                  {adresse || 'Sélectionner votre quartier'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.text.disabled} />
              </TouchableOpacity>
            </View>

            <InputField
              label="Numéro de téléphone"
              icon="call-outline"
              placeholder="Ex: 699887766"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              maxLength={9}
              autoCorrect={false}
            />
          </View>

          {/* Bouton changer mdp */}
          <TouchableOpacity style={s.mdpCard} onPress={() => setModalPassword(true)}>
            <View style={s.mdpCardLeft}>
              <View style={s.mdpCardIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={s.mdpCardTitle}>Changer le mot de passe</Text>
                <Text style={s.mdpCardSub}>Mettre à jour votre mot de passe actuel</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>

          {/* Sauvegarder */}
          <TouchableOpacity
            style={[s.btnSave, loading && { opacity: 0.7 }]}
            onPress={handleSauvegarder}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={s.btnSaveText}>Sauvegarder les modifications</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  content: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text.primary },

  scroll: { padding: SPACING.md, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md,
    ...SHADOWS.light,
  },

  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background, height: 52,
  },
  inputWrapError: { borderColor: COLORS.error, backgroundColor: COLORS.error + '06' },
  inputWrapSuccess: { borderColor: COLORS.success, backgroundColor: COLORS.success + '06' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text.primary, height: 52 },
  eyeBtn: { padding: 8 },

  // Changer mdp card
  mdpCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  mdpCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  mdpCardIcon: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  mdpCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  mdpCardSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },

  btnSave: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, height: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnSaveText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Modal commun
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%', paddingBottom: 16,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalHeadTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },

  // Recherche
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    margin: SPACING.md, backgroundColor: COLORS.background, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text.primary },

  // Quartiers
  arrRow: {
    paddingHorizontal: SPACING.lg, paddingVertical: 8,
    backgroundColor: COLORS.primary + '0A',
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  arrLabel: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  quartierItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  quartierItemActive: { backgroundColor: COLORS.primary + '08' },
  quartierText: { flex: 1, fontSize: 15, color: COLORS.text.secondary },
  quartierTextActive: { color: COLORS.primary, fontWeight: '700' },
  selectedTag: {
    backgroundColor: COLORS.primary + '18', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  selectedTagText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },

  // Modal mot de passe
  mdpIconWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  mdpIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  mdpSub: { fontSize: 13, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 20 },

  forceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  forceBarre: { flex: 1, height: 4, borderRadius: 2 },
  forceLabel: { fontSize: 11, fontWeight: '700', marginLeft: 4, minWidth: 40 },

  feedbackError: { fontSize: 11, color: COLORS.error, marginTop: 4 },
  feedbackSuccess: { fontSize: 11, color: COLORS.success, marginTop: 4, fontWeight: '600' },

  mdpBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  btnAnnuler: {
    flex: 1, height: 52, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  btnAnnulerText: { fontSize: 15, fontWeight: '700', color: COLORS.text.secondary },
  btnConfirmer: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, height: 52,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnConfirmerText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
