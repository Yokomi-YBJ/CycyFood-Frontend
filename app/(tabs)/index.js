// app/(tabs)/index.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.md * 3) / 2;

// ── Skeleton card ────────────────────────────────────────
const ProductSkeleton = () => (
  <View style={styles.produitCard}>
    <Skeleton width="100%" height={140} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
    <View style={{ padding: SPACING.md }}>
      <Skeleton width="75%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="45%" height={11} style={{ marginBottom: 14 }} />
      <Skeleton width="100%" height={38} style={{ borderRadius: RADIUS.md }} />
    </View>
  </View>
);

const SpecialiteSkeleton = () => (
  <View style={styles.specialiteCard}>
    <Skeleton width={160} height={110} style={{ borderRadius: 0 }} />
    <View style={{ padding: SPACING.sm }}>
      <Skeleton width="80%" height={13} style={{ marginBottom: 4 }} />
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

  const headerAnim = useRef(new Animated.Value(0)).current;

  const fetchProduits = async () => {
    try {
      const res = await fetch(ENDPOINTS.produits);
      const data = await res.json();
      if (data.status === 'success') setProduits(data.produits);
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
    addToCart(produit);
    setAddedIds(prev => ({ ...prev, [produit.id_produit]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [produit.id_produit]: false }));
    }, 1400);
  };

  const heure = new Date().getHours();
  const salutation = heure < 6 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const salutIcon = heure < 12 ? '☀️' : heure < 18 ? '🌤️' : '🌙';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
     <StatusBar style="dark" backgroundColor="transparent" translucent={true} />

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
            <Text style={styles.salutation}>{salutIcon} {salutation},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.prenom_user || user?.nom_user || 'Bienvenue'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            
          </View>
        </Animated.View>

        {/* ─── HERO ───────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>Livraison disponible</Text>
            </View>
            <Text style={styles.heroTitle}>
              Le goût{'\n'}du local,{'\n'}<Text style={styles.heroAccent}>chez vous.</Text>
            </Text>
            <Text style={styles.heroSub}>
              Plats frais préparés à Ngaoundéré
            </Text>
          </View>

          <View style={styles.heroImageWrap}>
            <View style={styles.heroImageBg} />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
            {/* Prix flottant */}
            <View style={styles.floatingPrice}>
              <Text style={styles.floatingPriceText}>À partir de</Text>
              <Text style={styles.floatingPriceVal}>500 Fcfa</Text>
            </View>
          </View>
        </View>

        {/* ─── AVANTAGES ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avantagesRow}
        >
          {[
            { icon: 'restaurant',  label: 'Cuisine\nlocale',    color: COLORS.primary,   bg: COLORS.primary + '12' },
            { icon: 'flash',       label: 'Livraison\nrapide',  color: COLORS.secondary, bg: COLORS.secondary + '12' },
            { icon: 'wallet',      label: 'Prix\nabordables',   color: COLORS.accent,    bg: COLORS.accent + '25' },
            { icon: 'leaf',        label: 'Ingrédients\nfrais', color: '#27AE60',        bg: '#27AE6012' },
          ].map((item, i) => (
            <View key={i} style={[styles.avantageCard, { borderTopColor: item.color }]}>
              <View style={[styles.avantageIconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.avantageLabel}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ─── SPÉCIALITÉS ────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Nos <Text style={styles.accent}>Spécialités</Text>
            </Text>
          </View>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: SPACING.md, paddingRight: SPACING.sm, gap: SPACING.sm }}>
            {[1, 2, 3].map(i => <SpecialiteSkeleton key={i} />)}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialitesRow}
          >
            {produits.map(p => (
              <View key={p.id_produit} style={styles.specialiteCard}>
                <Image
                  source={{ uri: p.img_url }}
                  style={styles.specialiteImg}
                  defaultSource={require('../../assets/placeholder.png')}
                />
                <View style={styles.specialiteOverlay} />
                <View style={styles.specialiteInfo}>
                  <Text style={styles.specialiteNom} numberOfLines={1}>{p.nom_produit}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ─── POPULAIRES ─────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <View>
            <Text style={styles.sectionTitle}>
              Plats <Text style={styles.accent}>Disponibles</Text>
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
          </View>
        ) : (
          <View style={styles.grid}>
            {produits.map(p => {
              const isAdded = addedIds[p.id_produit];
              return (
                <View key={p.id_produit} style={styles.produitCard}>
                  <View style={styles.produitImgWrap}>
                    <Image
                      source={{ uri: p.img_url }}
                      style={styles.produitImg}
                      defaultSource={require('../../assets/placeholder.png')}
                    />
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>{p.Prix} F</Text>
                    </View>
                  </View>
                  <View style={styles.produitBody}>
                    <Text style={styles.produitNom} numberOfLines={2}>{p.nom_produit}</Text>
                    <Text style={styles.produitDesc} numberOfLines={1}>{p.description}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name="star" size={11} color="#F5C518" />
                      ))}
                      <Text style={styles.ratingText}> 5.0</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.commanderBtn, isAdded && styles.commanderBtnAdded]}
                      onPress={() => handleAddToCart(p)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isAdded ? 'checkmark-circle' : 'bag-add-outline'}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.commanderBtnText}>
                        {isAdded ? 'Ajouté !' : 'Commander'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flex: 1, paddingRight: SPACING.sm },
  salutation: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '900', color: COLORS.text.primary, letterSpacing: -0.5 },
  headerRight: {},
  notifBtn: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.light,
  },
  notifDot: {
    position: 'absolute', top: 11, right: 11,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2, borderColor: COLORS.surface,
  },

  // Hero
  hero: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 180,
    ...SHADOWS.medium,
  },
  heroDecorTop: {
    position: 'absolute', top: -40, right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecorBottom: {
    position: 'absolute', bottom: -30, left: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  heroContent: {
    flex: 1, padding: SPACING.lg, justifyContent: 'center', zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: SPACING.sm,
  },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  heroBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  heroTitle: {
    fontSize: 24, fontWeight: '900', color: '#fff',
    lineHeight: 30, marginBottom: SPACING.sm,
  },
  heroAccent: { color: 'rgba(255,255,255,0.7)' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: SPACING.md },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
  },
  heroBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  heroImageWrap: {
    width: 140, justifyContent: 'center', alignItems: 'center', padding: SPACING.md,
  },
  heroImageBg: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroImage: { width: 110, height: 110, borderRadius: RADIUS.xl, opacity: 0.95 },
  floatingPrice: {
    position: 'absolute', bottom: 16, right: 12,
    backgroundColor: '#fff', borderRadius: RADIUS.md,
    paddingHorizontal: 8, paddingVertical: 4,
    ...SHADOWS.light,
  },
  floatingPriceText: { fontSize: 9, color: COLORS.text.secondary, fontWeight: '600' },
  floatingPriceVal: { fontSize: 12, fontWeight: '900', color: COLORS.primary },

  // Avantages
  avantagesRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  avantageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: 90,
    alignItems: 'center',
    borderTopWidth: 3,
    ...SHADOWS.light,
  },
  avantageIconWrap: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avantageLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.text.primary,
    textAlign: 'center', lineHeight: 15,
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  sectionEyebrow: {
    fontSize: 11, fontWeight: '800', color: COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text.primary },
  accent: { color: COLORS.primary },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  seeAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },

  // Spécialités
  specialitesRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  specialiteCard: {
    width: 160, height: 120,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  specialiteImg: { width: '100%', height: '100%' },
  specialiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  specialiteInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.sm,
  },
  specialiteNom: {
    fontSize: 13, fontWeight: '800', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

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
  produitImgWrap: { position: 'relative' },
  produitImg: { width: '100%', height: 140 },
  priceBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  priceText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  produitBody: { padding: SPACING.sm + 2, paddingTop: SPACING.sm },
  produitNom: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary, lineHeight: 18, marginBottom: 2 },
  produitDesc: { fontSize: 11, color: COLORS.text.disabled, marginBottom: 6 },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '700' },
  commanderBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9,
  },
  commanderBtnAdded: { backgroundColor: COLORS.success },
  commanderBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
