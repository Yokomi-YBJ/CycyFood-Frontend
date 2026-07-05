// app/admin/produits.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput, ScrollView, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const CATEGORIES = ['Plat', 'Boisson', 'Dessert', 'Entrée', 'Snack', 'Fruit', 'Autre'];
const FORM_VIDE = { nom_produit: '', description: '', Prix: '', stock: '', categorie: 'Plat', disponible: 1 };

// ── Sélecteur de type de média robuste aux différentes versions d'expo-image-picker ──
// Sur certaines versions, l'énumération est `MediaType.images` (minuscule),
// sur d'autres l'ancienne API `MediaTypeOptions.Images` (majuscule) est utilisée.
// On construit dynamiquement l'option pour ne jamais planter avec "Cannot read
// property 'Images' of undefined".
const getMediaTypeOption = () => {
  if (ImagePicker.MediaType && ImagePicker.MediaType.images) {
    return [ImagePicker.MediaType.images];
  }
  if (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) {
    return ImagePicker.MediaTypeOptions.Images;
  }
  // Dernier recours : chaîne littérale acceptée par la lib native dans tous les cas
  return ['images'];
};

const ProduitsSkeleton = () => (
  <View style={{ padding: SPACING.md }}>
    {[1, 2, 3, 4].map(i => (
      <View key={i} style={styles.produitCard}>
        <Skeleton width={80} height={80} style={{ borderRadius: RADIUS.md }} />
        <View style={{ flex: 1, paddingHorizontal: SPACING.md, justifyContent: 'center', gap: 6 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="80%" height={12} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Skeleton width={60} height={14} />
            <Skeleton width={40} height={12} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

export default function AdminProduits() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [produitEdite, setProduitEdite] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [imageLocale, setImageLocale] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const fetchProduits = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminProduits, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      if (data && data.status === 'success') setProduits(data.produits);
    } catch (e) {
      showAlert({ title: 'Erreur', message: 'Impossible de charger les produits.', type: 'error' });
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
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({ title: 'Permission refusée', message: 'Autorisez l\'accès à la galerie.', type: 'error' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getMediaTypeOption(),
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const name = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        const type = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        setImageLocale({ uri: asset.uri, name, type });
      }
    } catch (err) {
      console.error('Erreur choisirImage:', err);
      showAlert({
        title: 'Erreur',
        message: 'Impossible d\'ouvrir la galerie. Réessayez.',
        type: 'error',
      });
    }
  };

  const sauvegarder = async () => {
    if (!form.nom_produit.trim()) { showAlert({ title: 'Requis', message: 'Nom du produit obligatoire.', type: 'warning' }); return; }
    if (!form.description.trim()) { showAlert({ title: 'Requis', message: 'Description obligatoire.', type: 'warning' }); return; }
    if (!form.Prix || isNaN(parseInt(form.Prix))) { showAlert({ title: 'Requis', message: 'Prix invalide.', type: 'warning' }); return; }
    if (!modeEdition && !imageLocale) { showAlert({ title: 'Requis', message: 'Veuillez choisir une image.', type: 'warning' }); return; }

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

      const url = modeEdition ? `${ENDPOINTS.adminProduits}/${produitEdite.id_produit}` : ENDPOINTS.adminProduits;
      const res = await fetch(url, {
        method: modeEdition ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      // Le serveur peut renvoyer un corps vide (erreur 500 sans JSON,
      // timeout proxy, etc.) : on lit le texte brut et on parse nous-mêmes
      // pour éviter le crash "Unexpected end of input" de res.json().
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        console.error('Réponse non-JSON du serveur:', raw);
        showAlert({
          title: 'Erreur serveur',
          message: `Réponse invalide du serveur (code ${res.status}). Réessayez plus tard.`,
          type: 'error',
        });
        return;
      }

      if (!data) {
        showAlert({ title: 'Erreur serveur', message: `Réponse vide du serveur (code ${res.status}).`, type: 'error' });
        return;
      }

      if (data.status === 'success') {
        setModalVisible(false);
        fetchProduits();
        showAlert({ title: 'Succès', message: modeEdition ? 'Produit modifié.' : 'Produit ajouté.', type: 'success' });
      } else {
        showAlert({ title: 'Erreur', message: data.message || 'Une erreur est survenue.', type: 'error' });
      }
    } catch (e) {
      console.error('Erreur sauvegarder:', e);
      showAlert({ title: 'Erreur', message: 'Vérifiez la connexion au serveur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const supprimer = (p) => {
    showAlert({
      title: `Supprimer "${p.nom_produit}" ?`,
      message: 'Cette action est irréversible.',
      type: 'warning',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          await fetch(`${ENDPOINTS.adminProduits}/${p.id_produit}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchProduits();
        } catch (e) {
          showAlert({ title: 'Erreur', message: 'Suppression échouée.', type: 'error' });
        }
      },
    });
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
      showAlert({ title: 'Erreur', message: 'Impossible de modifier la disponibilité.', type: 'error' });
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const renderProduit = ({ item }) => {
    const hasImageError = imageErrors[item.id_produit];

    return (
      <View style={[styles.produitCard, !item.disponible && { opacity: 0.6 }]}>
        {hasImageError || !item.img_url ? (
          <View style={[styles.produitImg, styles.imagePlaceholder]}>
            <Ionicons name="restaurant-outline" size={32} color={COLORS.text.disabled} />
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.img_url }}
            style={styles.produitImg}
            onError={() => handleImageError(item.id_produit)}
          />
        )}

        <View style={styles.produitInfo}>
          <View style={styles.produitTitreRow}>
            <Text style={styles.produitNom} numberOfLines={1}>{item.nom_produit}</Text>
            <View style={[styles.categoriePill, { backgroundColor: COLORS.primary + '15' }]}>
              <Text style={[styles.categorieText, { color: COLORS.primary }]}>{item.categorie || 'Plat'}</Text>
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
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: item.disponible ? COLORS.warning + '15' : COLORS.success + '15' }]}
            onPress={() => toggleDispo(item)}
          >
            <Ionicons
              name={item.disponible ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              color={item.disponible ? COLORS.warning : COLORS.success}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error + '15' }]} onPress={() => supprimer(item)}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modeEdition ? 'Modifier le produit' : 'Nouveau produit'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <TouchableOpacity style={styles.imagePickerBtn} onPress={choisirImage}>
                  {imageLocale ? (
                    <Image source={{ uri: imageLocale.uri }} style={styles.imagePreview} />
                  ) : modeEdition && produitEdite && produitEdite.img_url && !imageErrors[`edit-${produitEdite.id_produit}`] ? (
                    <Image
                      source={{ uri: produitEdite.img_url }}
                      style={styles.imagePreview}
                      onError={() => setImageErrors(prev => ({ ...prev, [`edit-${produitEdite.id_produit}`]: true }))}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={36} color={COLORS.text.disabled} />
                      <Text style={styles.imagePlaceholderText}>Choisir une image</Text>
                    </View>
                  )}
                  <View style={styles.imageEditOverlay}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>

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
                        placeholderTextColor={COLORS.text.disabled}
                        value={form[f.key]}
                        onChangeText={v => update(f.key, v)}
                        keyboardType={f.keyboard}
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Catégorie</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.catPill, form.categorie === c && styles.catPillActive]}
                        onPress={() => update('categorie', c)}
                      >
                        <Text style={[styles.catPillText, form.categorie === c && { color: '#fff' }]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <TouchableOpacity
                  style={styles.dispoRow}
                  onPress={() => update('disponible', form.disponible ? 0 : 1)}
                >
                  <View style={[styles.toggle, form.disponible && { backgroundColor: COLORS.success }]}>
                    <View style={[styles.toggleThumb, form.disponible && { transform: [{ translateX: 20 }] }]} />
                  </View>
                  <Text style={styles.dispoText}>Produit disponible</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSauvegarder}
                  onPress={sauvegarder}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnSauvegarderText}>{modeEdition ? 'Sauvegarder' : 'Ajouter'}</Text>
                  )}
                </TouchableOpacity>

                <View style={{ height: 80 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Produits</Text>
          <TouchableOpacity style={styles.addBtn} onPress={ouvrirAjouter}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ProduitsSkeleton />
        ) : (
          <FlatList
            data={produits}
            keyExtractor={item => item.id_produit.toString()}
            renderItem={renderProduit}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  addBtn: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.medium,
  },
  list: { padding: SPACING.md },
  produitCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md,
    padding: SPACING.sm, ...SHADOWS.light,
  },
  produitImg: { width: 80, height: 80, borderRadius: RADIUS.md },
  imagePlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  imagePlaceholderText: { fontSize: 10, color: COLORS.text.disabled, marginTop: 4 },
  produitInfo: { flex: 1, paddingHorizontal: SPACING.md, justifyContent: 'center' },
  produitTitreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  produitNom: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  categoriePill: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  categorieText: { fontSize: 10, fontWeight: '700' },
  produitDesc: { fontSize: 12, color: COLORS.text.secondary },
  produitStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  produitPrix: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  produitStock: { fontSize: 12, color: COLORS.text.secondary },
  produitActions: { justifyContent: 'space-between', padding: 4, gap: 6 },
  actionBtn: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  modalScroll: { padding: SPACING.md },
  imagePickerBtn: { alignSelf: 'center', marginBottom: SPACING.md },
  imagePreview: { width: 120, height: 120, borderRadius: RADIUS.lg },
  imageEditOverlay: {
    position: 'absolute', bottom: 4, right: 4,
    width: 28, height: 28, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 6 },
  inputWrapper: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, backgroundColor: COLORS.background,
    height: 52, justifyContent: 'center',
  },
  input: { fontSize: 15, color: COLORS.text.primary },
  catPill: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.surface,
  },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catPillText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  dispoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: SPACING.lg, padding: SPACING.md,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
  },
  toggle: { width: 44, height: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.text.disabled, padding: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: RADIUS.full, backgroundColor: '#fff' },
  dispoText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  btnSauvegarder: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    height: 56, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.medium,
  },
  btnSauvegarderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});