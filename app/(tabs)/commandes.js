// app/(tabs)/commandes.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Alert, RefreshControl, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: '#FF9800', bg: '#FF980015', icon: 'time-outline',             desc: 'Votre commande est en cours de traitement.' },
  confirmee:    { label: 'Confirmée',    color: '#2196F3', bg: '#2196F315', icon: 'checkmark-circle-outline', desc: 'Votre commande a été confirmée ! Venez la récupérer.' },
  en_livraison: { label: 'En livraison', color: '#9C27B0', bg: '#9C27B015', icon: 'bicycle-outline',          desc: 'Votre commande est en route vers vous 🛵' },
  livree:       { label: 'Livrée',       color: '#4CAF50', bg: '#4CAF5015', icon: 'bag-check-outline',        desc: 'Commande livrée. Bon appétit ! 🎉' },
  annulee:      { label: 'Annulée',      color: '#f44336', bg: '#f4433615', icon: 'close-circle-outline',     desc: 'Cette commande a été annulée.' },
};

// ── Règle "en cours" ──────────────────────────────────────
// Une commande est "en cours" si :
//   - Son statut est en_attente ou en_livraison
//   - OU son statut est confirmee (retrait sur place, pas encore récupéré)
//     ET elle date de moins de 3 jours
// Elle passe en "historique" si :
//   - Statut livree ou annulee
//   - OU statut confirmee depuis plus de 3 jours
const estEnCours = (cmd) => {
  const statut = cmd.statut || 'en_attente';

  if (statut === 'en_attente' || statut === 'en_livraison') return true;
  if (statut === 'annulee' || statut === 'livree') return false;

  if (statut === 'confirmee') {
    const dateCmd  = new Date(cmd.date_commande);
    const maintenant = new Date();
    const diffJours = (maintenant - dateCmd) / (1000 * 60 * 60 * 24);
    return diffJours < 3; // moins de 3 jours → encore en cours
  }

  return false;
};

export default function CommandesScreen() {
  const { token } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommandes = async () => {
    try {
      const res = await fetch(ENDPOINTS.mesCommandes, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setCommandes(data.commandes);
      else Alert.alert('Erreur', data.message);
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de charger vos commandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCommandes(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchCommandes(); }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const renderCommande = ({ item }) => {
    const statut      = item.statut || 'en_attente';
    const cfg         = STATUT_CFG[statut] || STATUT_CFG.en_attente;
    const aLivraison  = item.avec_livraison === 1 || item.avec_livraison === true;

    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>
          <View style={styles.cmdIdWrap}>
          </View>
          <View style={styles.cardHeaderRight}>
            {/* Badge type */}
            <View style={[styles.typeBadge, aLivraison ? styles.typeBadgeLivraison : styles.typeBadgeRetrait]}>
              <Ionicons
                name={aLivraison ? 'bicycle-outline' : 'storefront-outline'}
                size={10}
                color={aLivraison ? '#9C27B0' : '#4CAF50'}
              />
              <Text style={[styles.typeBadgeText, { color: aLivraison ? '#9C27B0' : '#4CAF50' }]}>
                {aLivraison ? 'Livraison' : 'Retrait'}
              </Text>
            </View>
            {/* Badge statut */}
            <View style={[styles.statutBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={13} color={cfg.color} />
              <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
        </View>

        {/* Message statut */}
        <View style={[styles.descRow, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.descText, { color: cfg.color }]}>{cfg.desc}</Text>
        </View>

        {/* Produits */}
        <View style={styles.produitsRow}>
          <Ionicons name="restaurant-outline" size={14} color="#aaa" />
          <Text style={styles.produitsText} numberOfLines={2}>
            {item.produits_noms || 'Produits non disponibles'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color="#aaa" />
              <Text style={styles.metaText}>{formatDate(item.date_commande)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color="#aaa" />
              <Text style={styles.metaText}>{item.heure_commande?.slice(0, 5)}</Text>
            </View>
          </View>
          <Text style={styles.totalVal}>{item.prix_commande} Fcfa</Text>
        </View>

        {item.note_admin && (
          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={14} color="#888" />
            <Text style={styles.noteText}>{item.note_admin}</Text>
          </View>
        )}
      </View>
    );
  };

  // ── Séparation en cours / historique ──────────────────────
  const enCours   = commandes.filter(c => estEnCours(c));
  const historique = commandes.filter(c => !estEnCours(c));

  // Construire la liste avec headers
  const listData = [
    ...(enCours.length > 0 ? [{ type: 'header', title: `En cours (${enCours.length})`, key: 'h1' }] : []),
    ...enCours.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
    ...(historique.length > 0 ? [{ type: 'header', title: `Historique (${historique.length})`, key: 'h2' }] : []),
    ...historique.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#f8f8f8" />
      <View style={styles.containt}> 
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchCommandes(); }} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : commandes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>Vos commandes passées apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => item.key || item.id_commande?.toString()}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.groupHeader}>{item.title}</Text>;
            }
            return renderCommande({ item });
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor:"#f8f8f8",},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  refreshBtn: { padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  groupHeader: { fontSize: 12, fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 },

  card: { backgroundColor: '#fff', borderRadius: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cmdIdWrap: { backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },


  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3 },
  typeBadgeLivraison: { backgroundColor: '#9C27B015' },
  typeBadgeRetrait: { backgroundColor: '#4CAF5015' },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },

  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statutText: { fontSize: 12, fontWeight: '700' },

  descRow: { marginHorizontal: 16, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  descText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },

  produitsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  produitsText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  footerLeft: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#aaa' },
  totalVal: { fontSize: 18, fontWeight: '900', color: '#FF6B35' },

  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  noteText: { flex: 1, fontSize: 12, color: '#888', fontStyle: 'italic' },
});
