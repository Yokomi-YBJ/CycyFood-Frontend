// app/(tabs)/index.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, RefreshControl, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ENDPOINTS } from '../../constants/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addedIds, setAddedIds] = useState({});

  const fetchProduits = async () => {
    try {
      const res = await fetch(ENDPOINTS.produits);
      const data = await res.json();
      if (data.status === 'success') {
        setProduits(data.produits);
      }
    } catch (e) {
      Alert.alert('Problème de connexion', 'Impossible de charger les produits. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
   
  useEffect(() => { fetchProduits(); }, [],);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProduits();
  }, []);

  const handleAddToCart = (produit) => {
    addToCart(produit);
    setAddedIds(prev => ({ ...prev, [produit.id_produit]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [produit.id_produit]: false }));
    }, 1200);
  };

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
      >
      <View style={styles.containt}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.userSalutation}>{salutation} 👋 </Text>
            <Text style={styles.userName}>{user?.nom_user}</Text>
            <Text style={styles.headerSub}>Que voulez-vous commander ?</Text>
          </View>
        </View>

        {/* ===== HERO BANNER ===== */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Local{'\n'}Rapide{'\n'}Délicieux...</Text>
            <View style={styles.heroBadges}>
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color="#FF6B35" />
                <Text style={styles.badgeText}> Qualité</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="flash" size={12} color="#FF6B35" />
                <Text style={styles.badgeText}> Rapide</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroRight}>
            <Image source={require('../../assets/logo.jpg')} style={styles.heroLogo} />
         
          </View>
        </View>

        {/* ===== AVANTAGES ===== */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avantages} contentContainerStyle={{ paddingRight: 16 }}>
          {[
            { icon: 'restaurant-outline', label: 'Mets de qualité', color: '#FF6B35' },
            { icon: 'cash-outline', label: 'Prix abordable', color: '#4CAF50' },
            { icon: 'bicycle-outline', label: 'Livraison rapide', color: '#2196F3' },
          ].map((item, i) => (
            <View key={i} style={styles.avantageCard}>
              <View style={[styles.avantageIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.avantageLabel}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ===== NOS SPÉCIALITÉS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nos <Text style={styles.accent}>Spécialités</Text></Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialites} contentContainerStyle={{ paddingRight: 16 }}>
              {produits.map(p => (
                <View key={p.id_produit} style={styles.specialiteCard}>
                  <Image
                    source={{ uri: p.img_url }}
                    style={styles.specialiteImg}
                    defaultSource={require('../../assets/placeholder.png')}
                  />
                  <Text style={styles.specialiteNom}>{p.nom_produit}</Text>
                  <Text style={styles.specialiteDesc} numberOfLines={2}>{p.description}</Text>
                </View>
              ))}
            </ScrollView>

            {/* ===== PLATS POPULAIRES ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nos plats <Text style={styles.accent}>populaires</Text></Text>
            </View>

            <View style={styles.produitsGrid}>
              {produits.map(p => (
                <View key={p.id_produit} style={styles.produitCard}>
                  <Image
                    source={{ uri: p.img_url }}
                    style={styles.produitImg}
                    defaultSource={require('../../assets/placeholder.png')}
                  />
                  <View style={styles.produitPriceBadge}>
                    <Text style={styles.produitPrice}>{p.Prix} Fcfa</Text>
                  </View>
                  <View style={styles.produitInfo}>
                    <Text style={styles.produitNom}>{p.nom_produit}</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name="star" size={12} color="#FFD700" />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={[styles.btnCommander, addedIds[p.id_produit] && styles.btnCommanderActive]}
                      onPress={() => handleAddToCart(p)}
                    >
                      <Ionicons
                        name={addedIds[p.id_produit] ? 'checkmark-circle' : 'bag-add-outline'}
                        size={16} color="#fff"
                      />
                      <Text style={styles.btnCommanderText}>
                        {addedIds[p.id_produit] ? 'Ajouté !' : 'Commander'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
        </View>
  

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  salutation: { fontSize: 14, color: '#888' },
  userName: { fontSize: 22, fontWeight: '600', color: '#1b1b1b', marginTop: 2 },
   userSalutation: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  headerSub: { fontSize: 13, color: '#aaa', marginTop: 2 },
  hero: {
    marginHorizontal: 16, marginVertical: 12, borderRadius: 20,
    backgroundColor: '#FF6B35', padding: 24, flexDirection: 'row',
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 34 },
  heroBadges: { flexDirection: 'row', gap: 8, marginTop: 14 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  heroRight: { justifyContent: 'center', alignItems: 'center',},
  heroLogo: { width: 100, height: 100,borderRadius: 4,  },

  avantages: { paddingLeft: 16, paddingVertical: 20, marginBottom: 8 },
  avantageCard: {
    alignItems: 'center', marginRight: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    width: 110, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
  },
  avantageIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avantageLabel: { fontSize: 11, fontWeight: '600', color: '#444', textAlign: 'center' },

  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  accent: { color: '#FF6B35' },

  specialites: { paddingLeft: 16, paddingVertical: 16, marginBottom: 8 },
  specialiteCard: {
    width: 160, marginRight: 12, borderRadius: 16, backgroundColor: '#fff',
    overflow: 'hidden', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 8, elevation: 3, paddingBottom: 8,
  },
  specialiteImg: { width: '100%', height: 120 },
  specialiteNom: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', padding: 10, paddingBottom: 4 },
  specialiteDesc: { fontSize: 11, color: '#888', paddingHorizontal: 10, paddingBottom: 10 },

  produitsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 16, marginBottom: 8,
  },
  produitCard: {
    width: CARD_W, borderRadius: 18, backgroundColor: '#fff',
    overflow: 'hidden', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 4,
  },
  produitImg: { width: '100%', height: 130 },
  produitPriceBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: '#FF6B35', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  produitPrice: { color: '#fff', fontSize: 11, fontWeight: '700' },
  produitInfo: { padding: 12 },
  produitNom: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  stars: { flexDirection: 'row', gap: 1, marginBottom: 10 },
  btnCommander: {
    backgroundColor: '#FF6B35', borderRadius: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8,
  },
  btnCommanderActive: { backgroundColor: '#4CAF50' },
  btnCommanderText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
