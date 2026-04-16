// app/(tabs)/profil/modifier.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { ENDPOINTS } from '../../../constants/api';

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

export default function ModifierProfilScreen() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();

  // ── États formulaire profil ──────────────────────────
  const [nom, setNom] = useState(user?.nom_user || '');
  const [prenom, setPrenom] = useState(user?.prenom_user || '');
  const [adresse, setAdresse] = useState(user?.adresse_user || '');
  const [telephone, setTelephone] = useState(user?.telephone?.toString() || '');
  const [loading, setLoading] = useState(false);

  // ── États modal quartier ─────────────────────────────
  const [modalQuartier, setModalQuartier] = useState(false);
  const [recherche, setRecherche] = useState('');

  // ── États modal mot de passe ─────────────────────────
  const [modalPassword, setModalPassword] = useState(false);
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingMdp, setLoadingMdp] = useState(false);

  const quartiersFiltres = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  // ── Sauvegarder les infos du profil ─────────────────
  const handleSauvegarder = async () => {
    if (!nom.trim() || !prenom.trim()) return Alert.alert('Champ requis', 'Nom et prénom obligatoires.');
    if (!adresse) return Alert.alert('Champ requis', 'Veuillez choisir votre quartier.');
    if (!telephone || telephone.length !== 9) return Alert.alert('Téléphone invalide', 'Le numéro doit contenir 9 chiffres.');

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
        Alert.alert('Succès', 'Votre profil a été mis à jour !', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erreur', data.message || 'Mise à jour échouée.');
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // ── Changer le mot de passe ──────────────────────────
  const handleChangerMdp = async () => {
    if (!ancienMdp) return Alert.alert('Champ requis', 'Entrez votre ancien mot de passe.');
    if (!nouveauMdp || nouveauMdp.length < 6) return Alert.alert('Mot de passe trop court', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
    if (nouveauMdp !== confirmMdp) return Alert.alert('Mots de passe différents', 'La confirmation ne correspond pas.');
    if (ancienMdp === nouveauMdp) return Alert.alert('Identique', 'Le nouveau mot de passe doit être différent de l\'ancien.');

    setLoadingMdp(true);
    try {
      const res = await fetch(ENDPOINTS.changerMotDePasse, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setModalPassword(false);
        setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
        Alert.alert('Mot de passe modifié', 'Votre mot de passe a bien été mis à jour.');
      } else {
        Alert.alert('Erreur', data.message || 'Modification échouée.');
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur.');
    } finally {
      setLoadingMdp(false);
    }
  };

  const fermerModalMdp = () => {
    setModalPassword(false);
    setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
    setShowAncien(false); setShowNouveau(false); setShowConfirm(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#fff" />

      {/* ── Modal Quartier ── */}
      <Modal visible={modalQuartier} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un quartier</Text>
              <TouchableOpacity onPress={() => { setModalQuartier(false); setRecherche(''); }}>
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
                if (!liste.length) return null;
                return (
                  <View key={arr}>
                    <Text style={styles.arrLabel}>Ngaoundéré {arr}</Text>
                    {liste.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.quartierItem, adresse === item.value && styles.quartierItemSelected]}
                        onPress={() => { setAdresse(item.value); setModalQuartier(false); setRecherche(''); }}
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

      {/* ── Modal Mot de passe ── */}
      <Modal visible={modalPassword} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerMdp}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={fermerModalMdp}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalMdpScroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">

              {/* Icône déco */}
              <View style={styles.mdpIconWrap}>
                <View style={styles.mdpIconCircle}>
                  <Ionicons name="lock-closed" size={32} color="#FF6B35" />
                </View>
                <Text style={styles.mdpSubtitle}>Choisissez un mot de passe fort d'au moins 6 caractères.</Text>
              </View>

              {/* Ancien mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ancien mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-open-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Votre mot de passe actuel"
                    placeholderTextColor="#bbb"
                    secureTextEntry={!showAncien}
                    value={ancienMdp}
                    onChangeText={setAncienMdp}
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  <TouchableOpacity onPress={() => setShowAncien(!showAncien)} style={styles.eyeBtn}>
                    <Ionicons name={showAncien ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nouveau mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Min. 6 caractères"
                    placeholderTextColor="#bbb"
                    secureTextEntry={!showNouveau}
                    value={nouveauMdp}
                    onChangeText={setNouveauMdp}
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  <TouchableOpacity onPress={() => setShowNouveau(!showNouveau)} style={styles.eyeBtn}>
                    <Ionicons name={showNouveau ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
                  </TouchableOpacity>
                </View>
                {/* Indicateur force */}
                {nouveauMdp.length > 0 && (
                  <View style={styles.forceRow}>
                    {[1,2,3,4].map(i => (
                      <View key={i} style={[
                        styles.forceBarre,
                        { backgroundColor: nouveauMdp.length >= i * 2
                          ? (nouveauMdp.length >= 8 ? '#4CAF50' : '#FF9800')
                          : '#eee' }
                      ]} />
                    ))}
                    <Text style={styles.forceLabel}>
                      {nouveauMdp.length < 4 ? 'Trop court' :
                       nouveauMdp.length < 6 ? 'Faible' :
                       nouveauMdp.length < 8 ? 'Moyen' : 'Fort'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirmer nouveau mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                <View style={[
                  styles.inputWrapper,
                  confirmMdp.length > 0 && nouveauMdp !== confirmMdp && styles.inputWrapperError,
                  confirmMdp.length > 0 && nouveauMdp === confirmMdp && styles.inputWrapperSuccess,
                ]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Répétez le nouveau mot de passe"
                    placeholderTextColor="#bbb"
                    secureTextEntry={!showConfirm}
                    value={confirmMdp}
                    onChangeText={setConfirmMdp}
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
                  </TouchableOpacity>
                </View>
                {confirmMdp.length > 0 && nouveauMdp !== confirmMdp && (
                  <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
                )}
                {confirmMdp.length > 0 && nouveauMdp === confirmMdp && (
                  <Text style={styles.successText}>Mots de passe identiques</Text>
                )}
              </View>

              {/* Boutons */}
              <View style={styles.mdpBtnsRow}>
                <TouchableOpacity style={styles.btnAnnuler} onPress={fermerModalMdp}>
                  <Text style={styles.btnAnnulerText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirmerMdp} onPress={handleChangerMdp} disabled={loadingMdp}>
                  {loadingMdp
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.btnConfirmerMdpText}>Confirmer</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Contenu principal ── */}
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <View style={styles.card}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Votre nom"
                  placeholderTextColor="#bbb"
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
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Votre prénom"
                  placeholderTextColor="#bbb"
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quartier</Text>
              <TouchableOpacity style={styles.inputWrapper} onPress={() => setModalQuartier(true)} activeOpacity={0.7}>
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
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="9 chiffres"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  maxLength={9}
                  autoCorrect={false}
                />
              </View>
            </View>

          </View>

          {/* Bouton changer mot de passe */}
          <TouchableOpacity
            style={styles.btnChangerMdp}
            onPress={() => setModalPassword(true)}
          >
            <View style={styles.btnChangerMdpLeft}>
              <View style={styles.btnChangerMdpIcon}>
                <Ionicons name="lock-closed-outline" size={18} color="#FF6B35" />
              </View>
              <View>
                <Text style={styles.btnChangerMdpTitle}>Changer le mot de passe</Text>
                <Text style={styles.btnChangerMdpSub}>Mettre à jour votre mot de passe actuel</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSauvegarder} onPress={handleSauvegarder} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.btnSauvegarderText}>Sauvegarder les modifications</Text>
                </>
            }
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  content: { flex: 1, backgroundColor: '#f4f4f8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  scroll: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 12,
    paddingHorizontal: 12, backgroundColor: '#fafafa', height: 52,
  },
  inputWrapperError: { borderColor: '#f44336', backgroundColor: '#fff5f5' },
  inputWrapperSuccess: { borderColor: '#4CAF50', backgroundColor: '#f5fff5' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 52, fontSize: 15, color: '#1a1a1a' },
  inputFlex: { flex: 1, height: 52, fontSize: 15, color: '#1a1a1a' },
  eyeBtn: { padding: 8 },
  selectText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  selectPlaceholder: { color: '#bbb' },
  errorText: { fontSize: 11, color: '#f44336', marginTop: 4, marginLeft: 4 },
  successText: { fontSize: 11, color: '#4CAF50', marginTop: 4, marginLeft: 4 },

  // Bouton changer mot de passe
  btnChangerMdp: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  btnChangerMdpLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnChangerMdpIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#FF6B3510', alignItems: 'center', justifyContent: 'center',
  },
  btnChangerMdpTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  btnChangerMdpSub: { fontSize: 11, color: '#aaa', marginTop: 2 },

  btnSauvegarder: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FF6B35', borderRadius: 14, height: 54,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnSauvegarderText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal commun
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30 },
  modalContainerMdp: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  modalMdpScroll: { padding: 20 },

  // Modal mot de passe
  mdpIconWrap: { alignItems: 'center', marginBottom: 24 },
  mdpIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B3510', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  mdpSubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Indicateur force
  forceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  forceBarre: { flex: 1, height: 4, borderRadius: 2 },
  forceLabel: { fontSize: 11, color: '#888', marginLeft: 4, minWidth: 50 },

  mdpBtnsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnAnnuler: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#eee', alignItems: 'center', justifyContent: 'center',
  },
  btnAnnulerText: { fontSize: 15, fontWeight: '700', color: '#888' },
  btnConfirmerMdp: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FF6B35', borderRadius: 14, height: 52,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnConfirmerMdpText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Quartier modal
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 12, margin: 16, backgroundColor: '#fafafa', height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a', marginLeft: 8 },
  arrLabel: { fontSize: 11, fontWeight: '800', color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#FF6B3508' },
  quartierItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  quartierItemSelected: { backgroundColor: '#FF6B3506' },
  quartierText: { fontSize: 14, color: '#333', flex: 1 },
  quartierTextSelected: { color: '#FF6B35', fontWeight: '700' },
});
