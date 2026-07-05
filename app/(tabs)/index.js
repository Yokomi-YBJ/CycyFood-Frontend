// app/(tabs)/index.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { getProduitsAvecCache } from '../../utils/produitsCache';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.md * 3) / 2;
const CATEGORIES_FIXES = ['Tout', 'Plat', 'Boisson', 'Dessert', 'Entrée', 'Snack'];

// ── Skeleton card ────────────────────────────────────────
const ProductSkeleton = () => (
  <View style={styles.produitCard}>
    <Skeleton width="100%" height={130} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
    <View style={{ padding: SPACING.md }}>
      <Skeleton width="75%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="45%" height={11} style={{ marginBottom: 14 }} />
      <Skeleton width="100%" height={38} style={{ borderRadius: RADIUS.md }} />
    </View>
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const { addToCart, totalArticles } = useCart();
  const { showAlert } = useAlert();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addedIds, setAddedIds] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [categorieActive, setCategorieActive] = useState('Tout');

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Utilise le cache local (AsyncStorage) synchronisé par ETag :
  // - Affichage instantané si un cache existe déjà sur l'appareil.
  // - Aucun retéléchargement de la liste si rien n'a changé côté admin
  //   (le serveur répond alors 304, sans payload).
  // - Mise à jour silencieuse du cache uniquement quand la BD a réellement
  //   changé (nouveau produit, stock modifié, prix modifié...).
  const fetchProduits = async () => {
    try {
      const { produits: liste } = await getProduitsAvecCache();
      setProduits(liste);
    } catch {
      showAlert({
        title: 'Connexion impossible',
        message: 'Vérifiez votre connexion internet.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProduits();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProduits();
  }, []);

  const handleAddToCart = (produit) => {
    const res = addToCart(produit);
    if (res && res.success === false) {
      showAlert({
        title: 'Limite atteinte',
        message: res.message,
        type: 'warning',
      });
      return;
    }
    setAddedIds(prev => ({ ...prev, [produit.id_produit]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [produit.id_produit]: false }));
    }, 1400);
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const heure = new Date().getHours();
  const salutation = heure < 6 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const salutIcon = heure < 12 ? 'sunny-outline' : heure < 18 ? 'partly-sunny-outline' : 'moon-outline';

  const produitsFiltres = categorieActive === 'Tout'
    ? produits
    : produits.filter(p => (p.categorie || 'Plat') === categorieActive);

  const categoriesPresentes = ['Tout', ...new Set(produits.map(p => p.categorie || 'Plat'))];
  const categoriesAffichees = CATEGORIES_FIXES.filter(c => categoriesPresentes.includes(c));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" backgroundColor={COLORS.primary} translucent={false} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* ─── HEADER ─────────────────────────────────────── */}
          <Animated.View style={[styles.header, {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }]
          }]}>
            <View style={styles.headerLeft}>
              <View style={styles.salutationRow}>
                <Ionicons name={salutIcon} size={14} color={COLORS.primary} />
                <Text style={styles.salutation}>{salutation}</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.prenom_user || user?.nom_user || 'Bienvenue'}
              </Text>
            </View>
          </Animated.View>

          {/* ─── HERO — signature visuelle ──────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroPattern} pointerEvents="none">
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.heroPatternRing, { width: 90 + i * 60, height: 90 + i * 60, opacity: 0.09 - i * 0.02 }]} />
              ))}
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>Ngaoundéré · Livraison active</Text>
              </View>
              <Text style={styles.heroTitle}>
                Le vrai goût,{'\n'}livré <Text style={styles.heroAccent}>chaud.</Text>
              </Text>
              <Text style={styles.heroSub}>
                {produits.length > 0 ? `${produits.length} plats préparés aujourd'hui` : 'Plats frais préparés localement'}
              </Text>
            </View>

            <View style={styles.heroImageWrap}>
              <View style={styles.heroImageBg} />
              <Image
                source={require('../../assets/logo.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* ─── CATÉGORIES ──────────────────────────────────── */}
          {categoriesAffichees.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categoriesAffichees.map(cat => {
                const active = categorieActive === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                    onPress={() => setCategorieActive(cat)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ─── PLATS DISPONIBLES ───────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {categorieActive === 'Tout' ? 'Tous les plats' : categorieActive}
            </Text>
            {!loading && (
              <Text style={styles.sectionCount}>{produitsFiltres.length} article{produitsFiltres.length > 1 ? 's' : ''}</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
            </View>
          ) : produitsFiltres.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={44} color={COLORS.text.disabled} />
              <Text style={styles.emptyStateText}>Aucun plat dans  pour le moment</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {produitsFiltres.map(p => {
                const isAdded = addedIds[p.id_produit];
                const hasImageError = imageErrors[p.id_produit];
                const enRupture = p.stock !== undefined && p.stock !== null && p.stock <= 0;
                return (
                  <View key={p.id_produit} style={[styles.produitCard, enRupture && styles.produitCardRupture]}>
                    <View style={styles.produitImgWrap}>
                      {hasImageError || !p.img_url ? (
                        <View style={styles.produitImageFallback}>
                          <Ionicons name="restaurant-outline" size={36} color={COLORS.text.disabled} />
                        </View>
                      ) : (
                        <Image
                          source={{ uri: p.img_url }}
                          style={styles.produitImg}
                          onError={() => handleImageError(p.id_produit)}
                        />
                      )}
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>{p.Prix} F</Text>
                      </View>
                      {enRupture && (
                        <View style={styles.ruptureOverlay}>
                          <Text style={styles.ruptureText}>Épuisé</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.produitBody}>
                      <Text style={styles.produitNom} numberOfLines={2}>{p.nom_produit}</Text>
                      <Text style={styles.produitDesc} numberOfLines={1}>{p.description}</Text>
                      <TouchableOpacity
                        style={[
                          styles.commanderBtn,
                          isAdded && styles.commanderBtnAdded,
                          enRupture && styles.commanderBtnDisabled,
                        ]}
                        onPress={() => !enRupture && handleAddToCart(p)}
                        activeOpacity={0.8}
                        disabled={enRupture}
                      >
                        <Ionicons
                          name={isAdded ? 'checkmark-circle' : enRupture ? 'close-circle-outline' : 'basket-outline'}
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.commanderBtnText}>
                          {enRupture ? 'Indisponible' : isAdded ? 'Ajouté' : 'Commander'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flex: 1 },
  salutationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  salutation: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '600' },
  userName: { fontSize: 23, fontWeight: '900', color: COLORS.text.primary, letterSpacing: -0.5, marginTop: 2 },

  // Hero — signature element : anneaux concentriques + badge live
  hero: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 190,
    ...SHADOWS.medium,
  },
  heroPattern: {
    position: 'absolute', top: 0, bottom: 0, right: -20,
    alignItems: 'center', justifyContent: 'center',
  },
  heroPatternRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  heroContent: {
    flex: 1, padding: SPACING.lg, justifyContent: 'center', zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: SPACING.sm,
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  heroBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  heroTitle: {
    fontSize: 25, fontWeight: '900', color: '#fff',
    lineHeight: 30, marginBottom: SPACING.sm, letterSpacing: -0.5,
  },
  heroAccent: { color: COLORS.accent },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroImageWrap: {
    width: 120, justifyContent: 'center', alignItems: 'center', padding: SPACING.md,
  },
  heroImageBg: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroImage: { width: 92, height: 92, borderRadius: RADIUS.lg, opacity: 0.97 },

  // Catégories
  categoriesRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  categoryChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  categoryChipTextActive: { color: '#fff' },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: COLORS.text.primary, letterSpacing: -0.3 },
  sectionCount: { fontSize: 12, color: COLORS.text.disabled, fontWeight: '600' },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg, gap: SPACING.sm,
  },
  emptyStateText: { fontSize: 13, color: COLORS.text.secondary, textAlign: 'center' },

  // Grille produits
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  produitCard: {
    width: CARD_W,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  produitCardRupture: { opacity: 0.75 },
  produitImgWrap: { position: 'relative' },
  produitImg: { width: '100%', height: 130 },
  produitImageFallback: {
    width: '100%', height: 130,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  priceBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  priceText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  ruptureOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(26,26,46,0.75)',
    paddingVertical: 5, alignItems: 'center',
  },
  ruptureText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  produitBody: { padding: SPACING.sm + 2, paddingTop: SPACING.sm },
  produitNom: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary, lineHeight: 18, marginBottom: 2 },
  produitDesc: { fontSize: 11, color: COLORS.text.disabled, marginBottom: 10 },
  commanderBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9,
  },
  commanderBtnAdded: { backgroundColor: COLORS.success },
  commanderBtnDisabled: { backgroundColor: COLORS.text.disabled },
  commanderBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
