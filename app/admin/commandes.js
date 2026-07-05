// app/admin/commandes.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const STATUTS = [
  { key: null,           label: 'Toutes',       color: COLORS.text.secondary },
  { key: 'en_attente',   label: 'En attente',   color: COLORS.warning },
  { key: 'confirmee',    label: 'Confirmée',    color: COLORS.info },
  { key: 'en_livraison', label: 'En livraison', color: '#9C27B0' },
  { key: 'livree',       label: 'Livrée',       color: COLORS.success },
  { key: 'annulee',      label: 'Annulée',      color: COLORS.error },
];

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning,   bg: COLORS.warning + '15',   icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info,      bg: COLORS.info + '15',      icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0',        bg: '#9C27B015',             icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: COLORS.success,   bg: COLORS.success + '15',   icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: COLORS.error,     bg: COLORS.error + '15',     icon: 'close-circle-outline' },
};

const ClientsSkeleton = () => (
  <View style={{ padding: SPACING.md }}>
    {[1, 2, 3, 4].map(i => (
      <View key={i} style={[styles.card, { gap: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Skeleton width={48} height={48} style={{ borderRadius: RADIUS.md }} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="55%" height={15} />
            <Skeleton width="35%" height={12} />
          </View>
          <Skeleton width={40} height={24} style={{ borderRadius: RADIUS.full }} />
        </View>
      </View>
    ))}
  </View>
);

// ── Regroupe une liste de commandes par client ───────────
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
  return Array.from(map.values()).sort((a, b) => {
    // Priorité aux clients ayant au moins une commande en attente
    const aAttente = a.commandes.some(c => c.statut === 'en_attente') ? 1 : 0;
    const bAttente = b.commandes.some(c => c.statut === 'en_attente') ? 1 : 0;
    if (aAttente !== bAttente) return bAttente - aAttente;
    return b.commandes.length - a.commandes.length;
  });
}

function ClientGroupCard({ groupe, onPress }) {
  const nbCommandes = groupe.commandes.length;
  const nbEnAttente = groupe.commandes.filter(c => c.statut === 'en_attente').length;
  const totalMontant = groupe.commandes.reduce((sum, c) => sum + Number(c.prix_commande || 0), 0);

  // Statut "dominant" à afficher : en_attente prioritaire, sinon le plus récent
  const statutAffiche = nbEnAttente > 0 ? 'en_attente' : groupe.commandes[0]?.statut;
  const cfg = STATUT_CFG[statutAffiche] || STATUT_CFG.en_attente;

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
            {nbEnAttente > 0 ? `${nbEnAttente} en attente` : cfg.label}
          </Text>
        </View>
        <Text style={styles.montantText}>{totalMontant.toLocaleString()} Fcfa</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminCommandes() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState(null);
  const [recherche, setRecherche] = useState('');

  const fetchCommandes = async () => {
    try {
      const url = filtreStatut
        ? `${ENDPOINTS.adminCommandes}?statut=${filtreStatut}`
        : ENDPOINTS.adminCommandes;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setCommandes(data.commandes);
    } catch (e) {
      showAlert({ title: 'Erreur', message: 'Impossible de charger les commandes.', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchCommandes(); }, [filtreStatut]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchCommandes(); }, [filtreStatut]);

  const groupes = useMemo(() => {
    const parClient = regrouperParClient(commandes);
    if (!recherche.trim()) return parClient;
    const q = recherche.trim().toLowerCase();
    return parClient.filter(g =>
      `${g.nom_user} ${g.prenom_user}`.toLowerCase().includes(q) ||
      String(g.telephone_client || '').includes(q)
    );
  }, [commandes, recherche]);

  const ouvrirClient = (groupe) => {
    router.push({
      pathname: '/admin/client/[id]',
      params: {
        id: String(groupe.id_user),
        nom: groupe.nom_user,
        prenom: groupe.prenom_user,
        telephone: groupe.telephone_client,
        adresse: groupe.adresse_user || '',
        // Le filtre actif (ex: "en_attente") est transmis à l'écran détail :
        // si l'admin est en train de traiter les commandes en attente et
        // clique sur un client, l'écran suivant doit rester dans ce contexte
        // et n'afficher QUE les commandes de ce statut pour ce client.
        statutFiltre: filtreStatut || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.text.primary} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Commandes</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchCommandes(); }}>
            <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={17} color={COLORS.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client, un numéro..."
            placeholderTextColor={COLORS.text.disabled}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.text.disabled} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtresContainer}>
          <FlatList
            data={STATUTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.key)}
            contentContainerStyle={styles.filtresScroll}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={[styles.filtrePill, filtreStatut === s.key && { backgroundColor: s.color, borderColor: s.color }]}
                onPress={() => setFiltreStatut(s.key)}
              >
                <Text style={[styles.filtrePillText, filtreStatut === s.key && { color: '#fff' }]}>{s.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading
          ? <ClientsSkeleton />
          : <FlatList
              data={groupes}
              keyExtractor={item => String(item.id_user)}
              renderItem={({ item }) => <ClientGroupCard groupe={item} onPress={ouvrirClient} />}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={52} color={COLORS.text.disabled} />
                  <Text style={styles.emptyText}>Aucune commande trouvée</Text>
                </View>
              }
            />
        }
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text.primary },

  filtresContainer: { backgroundColor: COLORS.background },
  filtresScroll: { padding: SPACING.md, gap: SPACING.sm },
  filtrePill: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full,
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface,
  },
  filtrePillText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
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
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
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

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.text.secondary },
});
