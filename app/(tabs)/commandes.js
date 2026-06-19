// app/(tabs)/commandes.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning,   bg: COLORS.warning + '18',   icon: 'time-outline',             desc: 'Votre commande est en cours de traitement.' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info,      bg: COLORS.info + '18',      icon: 'checkmark-circle-outline', desc: 'Commande confirmée ! Venez récupérer votre repas.' },
  en_livraison: { label: 'En livraison', color: '#9C27B0',        bg: '#9C27B018',             icon: 'bicycle-outline',          desc: 'Votre commande est en route ! 🛵' },
  livree:       { label: 'Livrée',       color: COLORS.success,   bg: COLORS.success + '18',   icon: 'bag-check-outline',        desc: 'Commande livrée. Bon appétit ! 🎉' },
  annulee:      { label: 'Annulée',      color: COLORS.error,     bg: COLORS.error + '18',     icon: 'close-circle-outline',     desc: 'Cette commande a été annulée.' },
};

const estEnCours = (cmd) => {
  const statut = cmd.statut || 'en_attente';
  if (statut === 'en_attente' || statut === 'en_livraison') return true;
  if (statut === 'annulee' || statut === 'livree') return false;
  if (statut === 'confirmee') {
    const diffJours = (new Date() - new Date(cmd.date_commande)) / (1000 * 60 * 60 * 24);
    return diffJours < 3;
  }
  return false;
};

function CommandeCard({ item }) {
  const statut     = item.statut || 'en_attente';
  const cfg        = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  const aLivraison = item.avec_livraison === 1 || item.avec_livraison === true;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <View style={styles.card}>
      {/* Bande colorée en haut selon statut */}
      <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.statutBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={13} color={cfg.color} />
          <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={[styles.typeBadge, {
          backgroundColor: aLivraison ? '#9C27B018' : COLORS.success + '18'
        }]}>
          <Ionicons
            name={aLivraison ? 'bicycle-outline' : 'storefront-outline'}
            size={11}
            color={aLivraison ? '#9C27B0' : COLORS.success}
          />
          <Text style={[styles.typeBadgeText, {
            color: aLivraison ? '#9C27B0' : COLORS.success
          }]}>
            {aLivraison ? 'Livraison' : 'Retrait'}
          </Text>
        </View>
      </View>

      {/* Message statut */}
      <View style={[styles.statusMsgRow, { backgroundColor: cfg.bg }]}>
        <Ionicons name="information-circle-outline" size={13} color={cfg.color} />
        <Text style={[styles.statusMsg, { color: cfg.color }]}>{cfg.desc}</Text>
      </View>

      {/* Produits */}
      <View style={styles.produitsRow}>
        <View style={styles.produitsIconWrap}>
          <Ionicons name="restaurant-outline" size={14} color={COLORS.text.disabled} />
        </View>
        <Text style={styles.produitsText} numberOfLines={2}>
          {item.produits_noms || 'Détails non disponibles'}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.text.disabled} />
            <Text style={styles.metaText}>{formatDate(item.date_commande)}</Text>
          </View>
          {item.heure_commande && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={COLORS.text.disabled} />
              <Text style={styles.metaText}>{item.heure_commande?.slice(0, 5)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.prixTotal}>{item.prix_commande} <Text style={styles.fcfa}>Fcfa</Text></Text>
      </View>

      {/* Note admin */}
      {item.note_admin ? (
        <View style={styles.noteRow}>
          <Ionicons name="chatbubble-outline" size={12} color={COLORS.text.disabled} />
          <Text style={styles.noteText}>{item.note_admin}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function CommandesScreen() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
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
      else showAlert({ title: 'Erreur', message: data.message, type: 'error' });
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de charger vos commandes.', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCommandes(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchCommandes(); }, []);

  const enCours    = commandes.filter(c => estEnCours(c));
  const historique = commandes.filter(c => !estEnCours(c));

  const listData = [
    ...(enCours.length > 0 ? [{ type: 'header', title: `En cours`, count: enCours.length, key: 'h1' }] : []),
    ...enCours.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
    ...(historique.length > 0 ? [{ type: 'header', title: 'Historique', count: historique.length, key: 'h2' }] : []),
    ...historique.map(c => ({ ...c, type: 'item', key: `c_${c.id_commande}` })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

        <StatusBar style="dark" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Mes achats</Text>
          <Text style={styles.headerTitle}>Commandes</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => { setLoading(true); fetchCommandes(); }}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Résumé rapide */}
      {!loading && commandes.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.summaryVal}>{enCours.length}</Text>
            <Text style={styles.summaryLabel}>En cours</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.summaryVal}>{historique.filter(c => c.statut === 'livree').length}</Text>
            <Text style={styles.summaryLabel}>Livrées</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.text.disabled }]}>
            <Text style={styles.summaryVal}>{commandes.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement de vos commandes…</Text>
        </View>
      ) : commandes.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="receipt-outline" size={52} color={COLORS.text.disabled} />
          </View>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>
            Vos futures commandes apparaîtront ici. Commencez par explorer nos plats !
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => item.key || item.id_commande?.toString()}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupHeaderText}>{item.title}</Text>
                  <View style={styles.groupHeaderBadge}>
                    <Text style={styles.groupHeaderCount}>{item.count}</Text>
                  </View>
                </View>
              );
            }
            return <CommandeCard item={item} />;
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
  },
  headerEyebrow: {
    fontSize: 11, fontWeight: '800', color: COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text.primary, letterSpacing: -0.5 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
  },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm + 2, borderLeftWidth: 3,
    ...SHADOWS.light,
  },
  summaryVal: { fontSize: 22, fontWeight: '900', color: COLORS.text.primary },
  summaryLabel: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14, color: COLORS.text.secondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.sm },
  emptyText: { fontSize: 15, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22 },

  list: { paddingHorizontal: SPACING.md, paddingBottom: 30 },

  groupHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: SPACING.lg, marginBottom: SPACING.sm,
  },
  groupHeaderText: {
    fontSize: 12, fontWeight: '800', color: COLORS.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  groupHeaderBadge: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  groupHeaderCount: { fontSize: 10, fontWeight: '900', color: '#fff' },

  // Carte commande
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    marginBottom: SPACING.md, overflow: 'hidden',
    ...SHADOWS.light,
  },
  cardAccent: { height: 4, width: '100%' },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  statutBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  statutText: { fontSize: 12, fontWeight: '700' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },

  statusMsgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: SPACING.md, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 7,
    marginBottom: SPACING.sm,
  },
  statusMsg: { fontSize: 12, fontWeight: '500', flex: 1 },

  produitsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  produitsIconWrap: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  produitsText: { flex: 1, fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  footerMeta: { gap: 3 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: COLORS.text.disabled },
  prixTotal: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  fcfa: { fontSize: 13, fontWeight: '600' },

  noteRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
  },
  noteText: {
    flex: 1, fontSize: 12, color: COLORS.text.disabled,
    fontStyle: 'italic', lineHeight: 17,
  },
});
