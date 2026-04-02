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
  en_attente:   { label: 'En attente',   color: '#FF9800', bg: '#FF980015', icon: 'time-outline',          desc: 'Votre commande est en cours de traitement.' },
  confirmee:    { label: 'Confirmée ✓',  color: '#2196F3', bg: '#2196F315', icon: 'checkmark-circle-outline', desc: 'Votre commande a été confirmée par Cycy-Food !' },
  en_livraison: { label: 'En livraison', color: '#9C27B0', bg: '#9C27B015', icon: 'bicycle-outline',       desc: 'Votre commande est en route vers vous 🛵' },
  livree:       { label: 'Livrée',       color: '#4CAF50', bg: '#4CAF5015', icon: 'bag-check-outline',     desc: 'Commande livrée. Bon appétit ! 🎉' },
  annulee:      { label: 'Annulée',      color: '#f44336', bg: '#f4433615', icon: 'close-circle-outline',  desc: 'Cette commande a été annulée.' },
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommandes();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const renderCommande = ({ item }) => {
    const statut = item.statut || 'en_attente';
    const cfg = STATUT_CFG[statut] || STATUT_CFG.en_attente;

    return (
      <View style={styles.card}>

        {/* Header carte */}
        <View style={styles.cardHeader}>
          <View style={styles.cmdIdWrap}>
            <Text style={styles.cmdId}>#{item.id_commande}</Text>
          </View>
          <View style={[styles.statutBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={13} color={cfg.color} />
            <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
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

        {/* Note admin si présente */}
        {item.note_admin && (
          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={14} color="#888" />
            <Text style={styles.noteText}>{item.note_admin}</Text>
          </View>
        )}
      </View>
    );
  };

  // Séparer par statut pour l'affichage
  const actives = commandes.filter(c => ['en_attente', 'confirmee', 'en_livraison'].includes(c.statut || 'en_attente'));
  const terminees = commandes.filter(c => ['livree', 'annulee'].includes(c.statut || ''));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

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
          data={[
            ...(actives.length > 0 ? [{ type: 'header', title: `En cours (${actives.length})`, key: 'h1' }] : []),
            ...actives.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
            ...(terminees.length > 0 ? [{ type: 'header', title: `Historique (${terminees.length})`, key: 'h2' }] : []),
            ...terminees.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
          ]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
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
  cmdIdWrap: { backgroundColor: '#FF6B3512', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cmdId: { color: '#FF6B35', fontSize: 13, fontWeight: '800' },
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
