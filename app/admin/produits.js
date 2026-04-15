// app/admin/produits.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, StatusBar,
  Modal, TextInput, ScrollView, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

const CATEGORIES = ['Plat', 'Boisson', 'Dessert', 'Entrée', 'Snack', 'Fruit', 'Autre'];

const FORM_VIDE = { nom_produit: '', description: '', Prix: '', stock: '', categorie: 'Plat', disponible: 1 };

export default function AdminProduits() {
  const { token } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [produitEdite, setProduitEdite] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [imageLocale, setImageLocale] = useState(null); // { uri, name, type }
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const fetchProduits = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminProduits, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setProduits(data.produits);
    } catch (e) {
      Alert.alert('Problème de connexion', 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProduits(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchProduits(); }, []);

  const ouvrirAjouter = () => {
    setModeEdition(false);
    setProduitEdite(null);
    setForm(FORM_VIDE);
    setImageLocale(null);
    setModalVisible(true);
  };

  const ouvrirModifier = (p) => {
    setModeEdition(true);
    setProduitEdite(p);
    setForm({
      nom_produit: p.nom_produit,
      description: p.description,
      Prix: p.Prix.toString(),
      stock: p.stock?.toString() || '0',
      categorie: p.categorie || 'Plat',
      disponible: p.disponible,
    });
    setImageLocale(null);
    setModalVisible(true);
  };

  const choisirImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop();
      const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
      setImageLocale({ uri: asset.uri, name, type });
    }
  };

  const sauvegarder = async () => {
    if (!form.nom_produit.trim()) return Alert.alert('Requis', 'Nom du produit obligatoire.');
    if (!form.description.trim()) return Alert.alert('Requis', 'Description obligatoire.');
    if (!form.Prix || isNaN(parseInt(form.Prix))) return Alert.alert('Requis', 'Prix invalide.');
    if (!modeEdition && !imageLocale) return Alert.alert('Requis', 'Veuillez choisir une image.');

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nom_produit', form.nom_produit.trim());
      formData.append('description', form.description.trim());
      formData.append('Prix', parseInt(form.Prix).toString());
      formData.append('stock', parseInt(form.stock) || 0);
      formData.append('categorie', form.categorie);
      formData.append('disponible', form.disponible.toString());

      if (imageLocale) {
        formData.append('image', {
          uri: Platform.OS === 'android' ? imageLocale.uri : imageLocale.uri.replace('file://', ''),
          name: imageLocale.name,
          type: imageLocale.type,
        });
      }

      const url = modeEdition
        ? `${ENDPOINTS.adminProduits}/${produitEdite.id_produit}`
        : ENDPOINTS.adminProduits;
      const method = modeEdition ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.status === 'success') {
        setModalVisible(false);
        fetchProduits();
        Alert.alert('✅', modeEdition ? 'Produit modifié !' : 'Produit ajouté !');
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (e) {
      Alert.alert('Problème de connexion', 'Vérifiez la connexion au serveur et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = (p) => {
    Alert.alert(
      `Supprimer "${p.nom_produit}" ?`,
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${ENDPOINTS.adminProduits}/${p.id_produit}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchProduits();
            } catch (e) {
              Alert.alert('Erreur', 'Suppression échouée.');
            }
          },
        },
      ]
    );
  };

  const toggleDispo = async (p) => {
    try {
      const res = await fetch(`${ENDPOINTS.adminProduits}/${p.id_produit}/disponibilite`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') fetchProduits();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de modifier la disponibilité.');
    }
  };

  const renderProduit = ({ item }) => (
    <View style={[styles.produitCard, !item.disponible && styles.produitCardGrise]}>
      <Image source={{ uri: item.img_url }} style={styles.produitImg} defaultSource={require('../../assets/placeholder.png')} />
      <View style={styles.produitInfo}>
        <View style={styles.produitTitreRow}>
          <Text style={styles.produitNom} numberOfLines={1}>{item.nom_produit}</Text>
          <View style={[styles.categoriePill, !item.disponible && { backgroundColor: '#eee' }]}>
            <Text style={[styles.categorieText, !item.disponible && { color: '#aaa' }]}>{item.categorie || 'Plat'}</Text>
          </View>
        </View>
        <Text style={styles.produitDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.produitStatsRow}>
          <Text style={styles.produitPrix}>{item.Prix} Fcfa</Text>
          <Text style={styles.produitStock}>Stock : {item.stock || 0}</Text>
        </View>
      </View>
      <View style={styles.produitActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => ouvrirModifier(item)}>
          <Ionicons name="pencil" size={16} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: item.disponible ? '#FF980018' : '#4CAF5018' }]} onPress={() => toggleDispo(item)}>
          <Ionicons name={item.disponible ? 'eye-off-outline' : 'eye-outline'} size={16} color={item.disponible ? '#FF9800' : '#4CAF50'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f4433618' }]} onPress={() => supprimer(item)}>
          <Ionicons name="trash-outline" size={16} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
    <View style={styles.containt}>
      {/* Modal ajouter/modifier */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modeEdition ? 'Modifier le produit' : 'Nouveau produit'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">

              {/* Image */}
              <TouchableOpacity style={styles.imagePickerBtn} onPress={choisirImage}>
                {imageLocale ? (
                  <Image source={{ uri: imageLocale.uri }} style={styles.imagePreview} />
                ) : modeEdition && produitEdite ? (
                  <Image source={{ uri: produitEdite.img_url }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={36} color="#aaa" />
                    <Text style={styles.imagePlaceholderText}>Toucher pour choisir une image</Text>
                  </View>
                )}
                <View style={styles.imageEditOverlay}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Champs */}
              {[
                { label: 'Nom du produit *', key: 'nom_produit', placeholder: 'Ex: Ndolé', keyboard: 'default' },
                { label: 'Description *', key: 'description', placeholder: 'Brève description', keyboard: 'default' },
                { label: 'Prix (Fcfa) *', key: 'Prix', placeholder: 'Ex: 1500', keyboard: 'numeric' },
                { label: 'Stock', key: 'stock', placeholder: 'Ex: 20', keyboard: 'numeric' },
              ].map(f => (
                <View key={f.key} style={styles.inputGroup}>
                  <Text style={styles.label}>{f.label}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={f.placeholder}
                      placeholderTextColor="#bbb"
                      value={form[f.key]}
                      onChangeText={v => update(f.key, v)}
                      keyboardType={f.keyboard}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ))}

              {/* Catégorie */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catPill, form.categorie === c && styles.catPillActive]}
                      onPress={() => update('categorie', c)}
                    >
                      <Text style={[styles.catPillText, form.categorie === c && styles.catPillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Disponible */}
              <TouchableOpacity style={styles.dispoRow} onPress={() => update('disponible', form.disponible ? 0 : 1)}>
                <View style={[styles.toggle, form.disponible && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, form.disponible && styles.toggleThumbOn]} />
                </View>
                <Text style={styles.dispoText}>Produit disponible à la vente</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSauvegarder} onPress={sauvegarder} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name={modeEdition ? 'checkmark-circle-outline' : 'add-circle-outline'} size={20} color="#fff" />
                      <Text style={styles.btnSauvegarderText}>{modeEdition ? 'Sauvegarder' : 'Ajouter le produit'}</Text>
                    </>
                }
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={ouvrirAjouter}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Légende */}
      <View style={styles.legendeRow}>
        <Text style={styles.legendeText}>{produits.length} produit{produits.length > 1 ? 's' : ''} · </Text>
        <Text style={[styles.legendeText, { color: '#4CAF50' }]}>{produits.filter(p => p.disponible).length} disponibles</Text>
        <Text style={styles.legendeText}> · </Text>
        <Text style={[styles.legendeText, { color: '#aaa' }]}>{produits.filter(p => !p.disponible).length} masqués</Text>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        : <FlatList
            data={produits}
            keyExtractor={item => item.id_produit.toString()}
            renderItem={renderProduit}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyText}>Aucun produit. Ajoutez-en un !</Text>
              </View>
            }
          />
      }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  legendeRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
  legendeText: { fontSize: 12, color: '#aaa', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },

  produitCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  produitCardGrise: { opacity: 0.65 },
  produitImg: { width: 80, height: 80 },
  produitInfo: { flex: 1, padding: 10, justifyContent: 'space-between' },
  produitTitreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  produitNom: { flex: 1, fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  categoriePill: { backgroundColor: '#FF6B3515', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  categorieText: { fontSize: 10, color: '#FF6B35', fontWeight: '700' },
  produitDesc: { fontSize: 11, color: '#888' },
  produitStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  produitPrix: { fontSize: 14, fontWeight: '900', color: '#FF6B35' },
  produitStock: { fontSize: 11, color: '#aaa' },
  produitActions: { justifyContent: 'space-between', padding: 8, gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2196F318', alignItems: 'center', justifyContent: 'center' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '95%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  modalScroll: { padding: 20 },

  imagePickerBtn: { alignSelf: 'center', marginBottom: 20, position: 'relative' },
  imagePreview: { width: 120, height: 120, borderRadius: 16 },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#eee', borderStyle: 'dashed' },
  imagePlaceholderText: { fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 6 },
  imageEditOverlay: { position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },

  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  inputWrapper: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#fafafa', height: 50, justifyContent: 'center' },
  input: { fontSize: 15, color: '#1a1a1a' },

  catPill: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff' },
  catPillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catPillText: { fontSize: 13, fontWeight: '600', color: '#555' },
  catPillTextActive: { color: '#fff' },

  dispoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, padding: 14, backgroundColor: '#f8f8f8', borderRadius: 12 },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#ddd', padding: 2 },
  toggleOn: { backgroundColor: '#4CAF50' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleThumbOn: { transform: [{ translateX: 20 }] },
  dispoText: { fontSize: 14, color: '#333', fontWeight: '500' },

  btnSauvegarder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF6B35', borderRadius: 14, height: 54, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnSauvegarderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
