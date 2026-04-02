// app/profil/modifier.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const [nom, setNom] = useState(user?.nom_user || '');
  const [prenom, setPrenom] = useState(user?.prenom_user || '');
  const [adresse, setAdresse] = useState(user?.adresse_user || '');
  const [telephone, setTelephone] = useState(user?.telephone?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recherche, setRecherche] = useState('');

  const quartiersFiltres = QUARTIERS.filter(q =>
    q.label.toLowerCase().includes(recherche.toLowerCase())
  );

  const handleSauvegarder = async () => {
    if (!nom.trim() || !prenom.trim()) {
      return Alert.alert('Champ requis', 'Nom et prénom obligatoires.');
    }
    if (!adresse) {
      return Alert.alert('Champ requis', 'Veuillez choisir votre quartier.');
    }
    if (!telephone || telephone.length !== 9) {
      return Alert.alert('Téléphone invalide', 'Le numéro doit contenir 9 chiffres.');
    }

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.profil, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom, prenom, adresse, telephone }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Mettre à jour le contexte Auth avec les nouvelles infos
        if (updateUser) updateUser(data.user);
        Alert.alert('✅ Succès', 'Votre profil a été mis à jour !', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Erreur', data.message || 'Mise à jour échouée.');
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de contacter le serveur.\nVérifie que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
                if (!liste.length) return null;
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

        {/* Avatar dynamique */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {`${(nom || '?')[0]}${(prenom || '?')[0]}`.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.avatarHint}>Vos initiales s'affichent automatiquement</Text>
        </View>

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
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  scroll: { padding: 16, paddingBottom: 40 },

  avatarRow: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  avatarHint: { fontSize: 12, color: '#aaa' },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 52, fontSize: 15, color: '#1a1a1a' },
  selectText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  selectPlaceholder: { color: '#bbb' },

  btnSauvegarder: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FF6B35', borderRadius: 14, height: 54, marginTop: 20,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnSauvegarderText: { color: '#fff', fontSize: 16, fontWeight: '700' },

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
