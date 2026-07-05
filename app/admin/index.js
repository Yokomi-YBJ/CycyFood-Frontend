// app/admin/index.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning,   bg: COLORS.warning + '15',   icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info,      bg: COLORS.info + '15',      icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0',        bg: '#9C27B015',             icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: COLORS.success,   bg: COLORS.success + '15',   icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: COLORS.error,     bg: COLORS.error + '15',     icon: 'close-circle-outline' },
};

// ── Regroupe une liste de commandes par client ───────────
// Même logique que app/admin/commandes.js — garder ces deux écrans
// cohérents évite qu'un admin voie deux comportements différents
// pour une même donnée.
function regrouperParClient(commandes) {
  const map = new Map();
  for (const cmd of commandes) {
    const key = cmd.id_user;
    if (!map.has(key)) {
      map.set(key, {
        id_user: cmd.id_user,
        nom_user: cmd.nom_user,
        prenom_user: cmd.prenom_user,
        telephone_client: cmd.telephone_client,
        adresse_user: cmd.adresse_user,
        commandes: [],
      });
    }
    map.get(key).commandes.push(cmd);
  }
  return Array.from(map.values()).sort((a, b) => b.commandes.length - a.commandes.length);
}

function ClientGroupCard({ groupe, onPress }) {
  const nbCommandes = groupe.commandes.length;
  const totalMontant = groupe.commandes.reduce((sum, c) => sum + Number(c.prix_commande || 0), 0);
  const cfg = STATUT_CFG.en_attente;
  const initiales = `${groupe.nom_user?.[0] || '?'}${groupe.prenom_user?.[0] || ''}`.toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(groupe)} activeOpacity={0.75}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initiales}</Text>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientName} numberOfLines={1}>
            {groupe.nom_user} {groupe.prenom_user}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.text.secondary} />
            <Text style={styles.metaText} numberOfLines={1}>{groupe.adresse_user || 'Adresse inconnue'}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{nbCommandes}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.statutText, { color: cfg.color }]}>
            {nbCommandes} en attente
          </Text>
        </View>
        <Text style={styles.montantText}>{totalMontant.toLocaleString()} Fcfa</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminScreen() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommandesEnAttente = async () => {
    try {
      // Filtre appliqué directement côté serveur : on ne récupère que les
      // commandes en_attente, pas la totalité de la table.
      const res = await fetch(`${ENDPOINTS.adminCommandes}?statut=en_attente`, {
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

  // Stats globales : une requête dédiée et légère (agrégats SQL), distincte
  // de la liste détaillée des commandes en attente.
  const [stats, setStats] = useState(null);
  const fetchStats = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminStats, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setStats(data.stats);
    } catch {
      // Erreur silencieuse : les stats sont secondaires, la liste des
      // commandes en attente reste l'information prioritaire de l'écran.
    }
  };

  useEffect(() => { fetchCommandesEnAttente(); fetchStats(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommandesEnAttente();
    fetchStats();
  }, []);

  const groupes = useMemo(() => regrouperParClient(commandes), [commandes]);

  const ouvrirClient = (groupe) => {
    router.push({
      pathname: '/admin/client/[id]',
      params: {
        id: String(groupe.id_user),
        nom: groupe.nom_user,
        prenom: groupe.prenom_user,
        telephone: groupe.telephone_client,
        adresse: groupe.adresse_user || '',
        // Le dashboard ne montre que les commandes en attente : l'écran
        // détail doit rester dans ce contexte par défaut.
        statutFiltre: 'en_attente',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <View style={styles.header}>
          <View style={styles.headerDecor} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerEyebrow}>Tableau de bord</Text>
              <Text style={styles.headerTitle}>Admin LaTchop</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: 'Total', val: stats?.total_commandes ?? '-' },
              { label: 'En attente', val: commandes.length },
              { label: 'Livrées', val: stats ? (stats.total_commandes - stats.en_attente - stats.confirmees) : '-' },
              { label: 'CA (Fcfa)', val: stats ? Number(stats.chiffre_affaires).toLocaleString() : '-', small: true },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statVal, s.small && { fontSize: 14 }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clients avec commandes en attente</Text>
          {!loading && (
            <View style={styles.countBadgeHeader}>
              <Text style={styles.countBadgeHeaderText}>{groupes.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des commandes</Text>
          </View>
        ) : groupes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={52} color={COLORS.success} />
            <Text style={styles.emptyTitle}>Aucune commande en attente</Text>
            <Text style={styles.emptySub}>Toutes les commandes ont été traitées.</Text>
          </View>
        ) : (
          <FlatList
            data={groupes}
            keyExtractor={g => String(g.id_user)}
            renderItem={({ item }) => (
              <ClientGroupCard groupe={item} onPress={ouvrirClient} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
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
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, flex: 1 },
  countBadgeHeader: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  countBadgeHeaderText: { fontSize: 12, fontWeight: '900', color: COLORS.warning },

  list: { paddingHorizontal: SPACING.md, paddingBottom: 30, paddingTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: COLORS.text.secondary, flexShrink: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    minWidth: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.warning, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { fontSize: 12, fontWeight: '900', color: '#fff' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.sm, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  statutPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  statutText: { fontSize: 11, fontWeight: '700' },
  montantText: { fontSize: 14, fontWeight: '900', color: COLORS.primary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14, color: COLORS.text.secondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  emptySub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
});
