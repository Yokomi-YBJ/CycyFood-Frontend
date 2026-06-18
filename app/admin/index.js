// app/admin/index.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const STATUTS = [
  { value: 'en_attente',   label: 'En attente',   color: COLORS.warning,  icon: 'time-outline' },
  { value: 'confirmee',    label: 'Confirmée',    color: COLORS.info,     icon: 'checkmark-circle-outline' },
  { value: 'en_livraison', label: 'En livraison', color: '#9C27B0',       icon: 'bicycle-outline' },
  { value: 'livree',       label: 'Livrée',       color: COLORS.success,  icon: 'bag-check-outline' },
  { value: 'annulee',      label: 'Annulée',      color: COLORS.error,    icon: 'close-circle-outline' },
];

function StatutBadge({ statut }) {
  const cfg = STATUTS.find(s => s.value === statut) || STATUTS[0];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + '18' }]}>
      <Ionicons name={cfg.icon} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function CommandeCard({ item, onUpdateStatut }) {
  const [expanded, setExpanded] = useState(false);
  const aLivraison = item.avec_livraison === 1 || item.avec_livraison === true;

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>#{item.id_commande}</Text>
            </View>
            <View>
              <Text style={styles.clientName}>{item.client_nom}</Text>
              <Text style={styles.clientPhone}>{item.client_telephone}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.prix}>{item.prix_commande} F</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.text.disabled}
            />
          </View>
        </View>

        <View style={styles.cardMeta}>
          <StatutBadge statut={item.statut} />
          <View style={[styles.typeBadge, { backgroundColor: aLivraison ? '#9C27B018' : COLORS.success + '18' }]}>
            <Ionicons
              name={aLivraison ? 'bicycle-outline' : 'storefront-outline'}
              size={11}
              color={aLivraison ? '#9C27B0' : COLORS.success}
            />
            <Text style={[styles.typeBadgeText, { color: aLivraison ? '#9C27B0' : COLORS.success }]}>
              {aLivraison ? 'Livraison' : 'Retrait'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.date_commande)}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedSection}>
          {item.client_adresse && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.text.disabled} />
              <Text style={styles.infoText}>{item.client_adresse}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="restaurant-outline" size={14} color={COLORS.text.disabled} />
            <Text style={styles.infoText} numberOfLines={3}>{item.produits_noms}</Text>
          </View>

          {/* Actions statut */}
          <Text style={styles.actionTitle}>Changer le statut :</Text>
          <View style={styles.actionsGrid}>
            {STATUTS.filter(s => s.value !== item.statut).map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.actionBtn, { borderColor: s.color + '60', backgroundColor: s.color + '10' }]}
                onPress={() => onUpdateStatut(item.id_commande, s.value)}
              >
                <Ionicons name={s.icon} size={14} color={s.color} />
                <Text style={[styles.actionBtnText, { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function AdminScreen() {
  const { token, user, deconnexion } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('all');

  const fetchCommandes = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminCommandes, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setCommandes(data.commandes);
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de charger les commandes.', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCommandes(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchCommandes(); }, []);

  const handleUpdateStatut = async (idCommande, nouveauStatut) => {
    try {
      const res = await fetch(`${ENDPOINTS.adminCommandes}/${idCommande}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommandes(prev => prev.map(c =>
          c.id_commande === idCommande ? { ...c, statut: nouveauStatut } : c
        ));
        showAlert({
          title: 'Statut mis à jour',
          message: `Commande #${idCommande} → ${STATUTS.find(s => s.value === nouveauStatut)?.label}`,
          type: 'success',
        });
      }
    } catch {
      showAlert({ title: 'Erreur', message: 'Mise à jour échouée.', type: 'error' });
    }
  };

  const commandesFiltrees = filtreStatut === 'all'
    ? commandes
    : commandes.filter(c => c.statut === filtreStatut);

  const handleLogout = () => {
    showAlert({
      title: 'Déconnexion',
      message: 'Quitter le panneau admin ?',
      type: 'warning',
      confirmText: 'Déconnexion',
      cancelText: 'Annuler',
      onConfirm: async () => {
        await deconnexion();
        router.replace('/auth/login');
      },
    });
  };

  // Stats rapides
  const stats = {
    total:      commandes.length,
    attente:    commandes.filter(c => c.statut === 'en_attente').length,
    livraison:  commandes.filter(c => c.statut === 'en_livraison').length,
    livrees:    commandes.filter(c => c.statut === 'livree').length,
    ca:         commandes.filter(c => c.statut === 'livree').reduce((sum, c) => sum + Number(c.prix_commande || 0), 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header admin */}
      <View style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerEyebrow}>Tableau de bord</Text>
            <Text style={styles.headerTitle}>Admin LaTchop</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', val: stats.total, icon: 'receipt', color: '#fff' },
            { label: 'En attente', val: stats.attente, icon: 'time', color: COLORS.warning },
            { label: 'Livrées', val: stats.livrees, icon: 'bag-check', color: COLORS.success },
            { label: 'CA (F)', val: stats.ca.toLocaleString(), icon: 'wallet', color: COLORS.accent, small: true },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statVal, s.small && { fontSize: 14 }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filtres */}
      <View>
        <FlatList
          horizontal
          data={[{ value: 'all', label: 'Toutes', icon: 'list' }, ...STATUTS]}
          keyExtractor={i => i.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtresRow}
          renderItem={({ item }) => {
            const active = filtreStatut === item.value;
            const color = item.color || COLORS.primary;
            const count = item.value === 'all'
              ? commandes.length
              : commandes.filter(c => c.statut === item.value).length;
            return (
              <TouchableOpacity
                style={[styles.filtreChip, active && { backgroundColor: color, borderColor: color }]}
                onPress={() => setFiltreStatut(item.value)}
              >
                <Text style={[styles.filtreLabel, active && { color: '#fff' }]}>{item.label}</Text>
                <View style={[styles.filtreCount, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : color + '18' }]}>
                  <Text style={[styles.filtreCountText, { color: active ? '#fff' : color }]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des commandes…</Text>
        </View>
      ) : commandesFiltrees.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={52} color={COLORS.text.disabled} />
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptySub}>
            {filtreStatut === 'all' ? 'Aucune commande enregistrée.' : `Aucune commande "${STATUTS.find(s => s.value === filtreStatut)?.label}".`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={commandesFiltrees}
          keyExtractor={i => i.id_commande.toString()}
          renderItem={({ item }) => (
            <CommandeCard item={item} onUpdateStatut={handleUpdateStatut} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.md,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
  },
  headerEyebrow: {
    fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2, textAlign: 'center' },

  filtresRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filtreChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filtreLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  filtreCount: { borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  filtreCountText: { fontSize: 10, fontWeight: '900' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14, color: COLORS.text.secondary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  emptySub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },

  list: { paddingHorizontal: SPACING.md, paddingBottom: 30, paddingTop: SPACING.sm },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  idBadge: {
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  idText: { fontSize: 12, fontWeight: '900', color: COLORS.primary },
  clientName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  clientPhone: { fontSize: 12, color: COLORS.text.secondary },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  prix: { fontSize: 16, fontWeight: '900', color: COLORS.primary },

  cardMeta: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    gap: 8, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  dateText: { fontSize: 11, color: COLORS.text.disabled },

  expandedSection: {
    padding: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginBottom: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.text.secondary, lineHeight: 19 },

  actionTitle: {
    fontSize: 12, fontWeight: '800', color: COLORS.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: SPACING.sm, marginBottom: SPACING.sm,
  },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: RADIUS.md, borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});
