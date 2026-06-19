// app/admin/index.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal,
  ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

// ─ Utilitaire format de date JJ/MM/AA ──
const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const STATUTS = [
  { value: 'en_attente',   label: 'En attente',   color: COLORS.warning,  icon: 'time-outline' },
  { value: 'confirmee',    label: 'Confirmée',    color: COLORS.info,     icon: 'checkmark-circle-outline' },
  { value: 'en_livraison', label: 'En livraison', color: '#9C27B0',       icon: 'bicycle-outline' },
  { value: 'livree',       label: 'Livrée',       color: COLORS.success,  icon: 'bag-check-outline' },
  { value: 'annulee',      label: 'Annulée',      color: COLORS.error,    icon: 'close-circle-outline' },
];

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning,   bg: COLORS.warning + '15',   icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info,      bg: COLORS.info + '15',      icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0',        bg: '#9C27B015',             icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: COLORS.success,   bg: COLORS.success + '15',   icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: COLORS.error,     bg: COLORS.error + '15',     icon: 'close-circle-outline' },
};

const getTransitions = (statut, avec_livraison) => {
  if (avec_livraison) {
    return {
      en_attente:   ['en_livraison', 'annulee'],
      en_livraison: ['livree', 'annulee'],
      confirmee:    ['en_livraison', 'annulee'],
      livree:       [],
      annulee:      [],
    }[statut] || [];
  } else {
    return {
      en_attente: ['confirmee', 'annulee'],
      confirmee:  ['annulee'],
      livree:     [],
      annulee:    [],
    }[statut] || [];
  }
};

const LABELS_ACTION = {
  confirmee:    'Confirmer la commande',
  en_livraison: 'Mettre en livraison',
  livree:       'Marquer comme livrée',
  annulee:      'Annuler la commande',
};

function CommandeCard({ item, onPress }) {
  const cfg = STATUT_CFG[item.statut] || STATUT_CFG.en_attente;
  const aLivraison = item.avec_livraison === 1 || item.avec_livraison === true;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cmdHeader}>
        <Text style={styles.cmdId}>Commande N° {item.id_commande}</Text>
        <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={13} color={cfg.color} />
          <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.clientRow}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientAvatarText}>
            {(item.nom_user?.[0] + item.prenom_user?.[0]).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.nom_user} {item.prenom_user}</Text>
          <Text style={styles.clientPhone}>
            <Ionicons name="location-outline" size={12} color={COLORS.text.secondary} /> {item.adresse_user}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: aLivraison ? '#9C27B015' : COLORS.success + '18' }]}>
          <Ionicons
            name={aLivraison ? 'bicycle-outline' : 'storefront-outline'}
            size={11}
            color={aLivraison ? '#9C27B0' : COLORS.success}
          />
          <Text style={[styles.typeBadgeText, { color: aLivraison ? '#9C27B0' : COLORS.success }]}>
            {aLivraison ? 'Livraison' : 'Retrait'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDateShort(item.date_commande)} · {item.heure_commande?.slice(0, 5)}
        </Text>
        <Text style={styles.prix}>{item.prix_commande} Fcfa</Text>
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
  const [cmdSelectionnee, setCmdSelectionnee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const changerStatut = async (id, statut) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.adminCommandes}/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCmdSelectionnee(null);
        fetchCommandes();
        showAlert({
          title: 'Statut mis à jour',
          message: `Commande N° ${id} → ${STATUT_CFG[statut]?.label}`,
          type: 'success',
        });
      } else {
        showAlert({ title: 'Erreur', message: data.message, type: 'error' });
      }
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de modifier la commande.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const appelerClient = (telephone) => {
    Linking.openURL(`tel:${telephone}`)
      .catch(() => showAlert({ title: 'Erreur', message: "Impossible d'ouvrir le téléphone.", type: 'error' }));
  };

  const commandesEnAttente = commandes.filter(c => c.statut === 'en_attente');

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

  const stats = {
    total:      commandes.length,
    attente:    commandes.filter(c => c.statut === 'en_attente').length,
    livraison:  commandes.filter(c => c.statut === 'en_livraison').length,
    livrees:    commandes.filter(c => c.statut === 'livree').length,
    ca:         commandes.filter(c => c.statut === 'livree').reduce((sum, c) => sum + Number(c.prix_commande || 0), 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <Modal visible={!!cmdSelectionnee} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {cmdSelectionnee && (() => {
                const aLivraison = cmdSelectionnee.avec_livraison === 1 || cmdSelectionnee.avec_livraison === true;
                const transitions = getTransitions(cmdSelectionnee.statut, aLivraison);
                const cfg = STATUT_CFG[cmdSelectionnee.statut] || STATUT_CFG.en_attente;
                return (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Commande N° {cmdSelectionnee.id_commande}</Text>
                      <TouchableOpacity onPress={() => setCmdSelectionnee(null)}>
                        <Ionicons name="close" size={24} color={COLORS.text.primary} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll}>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Client</Text>
                        <View style={styles.modalInfoCard}>
                          <View style={styles.modalInfoRow}>
                            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.modalInfoText}>{cmdSelectionnee.nom_user} {cmdSelectionnee.prenom_user}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.modalInfoText}>{cmdSelectionnee.telephone_client}</Text>
                          </View>
                          {cmdSelectionnee.adresse_user ? (
                            <View style={styles.modalInfoRow}>
                              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                              <Text style={styles.modalInfoText}>{cmdSelectionnee.adresse_user}</Text>
                            </View>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          style={styles.callBtnLarge}
                          onPress={() => appelerClient(cmdSelectionnee.telephone_client)}
                        >
                          <Ionicons name="call" size={20} color="#fff" />
                          <Text style={styles.callBtnText}>Appeler le client</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Produits</Text>
                        <View style={styles.modalInfoCard}>
                          <Text style={styles.modalProduits}>{cmdSelectionnee.produits_detail}</Text>
                        </View>
                        <Text style={styles.modalTotal}>Total : {cmdSelectionnee.prix_commande} Fcfa</Text>
                      </View>

                      {transitions.length > 0 && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Changer le statut</Text>
                          {transitions.map(s => {
                            const scfg = STATUT_CFG[s];
                            return (
                              <TouchableOpacity
                                key={s}
                                style={[styles.actionStatutBtn, { borderColor: scfg.color, backgroundColor: scfg.bg }]}
                                onPress={() => {
                                  showAlert({
                                    title: `Passer en "${scfg.label}" ?`,
                                    message: 'Cette action sera visible par le client.',
                                    type: 'warning',
                                    confirmText: 'Confirmer',
                                    onConfirm: () => changerStatut(cmdSelectionnee.id_commande, s),
                                  });
                                }}
                                disabled={actionLoading}
                              >
                                <Ionicons name={scfg.icon} size={20} color={scfg.color} />
                                <Text style={[styles.actionStatutText, { color: scfg.color }]}>
                                  {LABELS_ACTION[s]}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </ScrollView>
                  </>
                );
              })()}
            </View>
          </View>
        </Modal>

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
              { label: 'Total', val: stats.total, icon: 'receipt', color: '#fff' },
              { label: 'En attente', val: stats.attente, icon: 'time', color: COLORS.warning },
              { label: 'Livrées', val: stats.livrees, icon: 'bag-check', color: COLORS.success },
              { label: 'CA (Fcfa)', val: stats.ca.toLocaleString(), icon: 'wallet', color: COLORS.accent, small: true },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statVal, s.small && { fontSize: 14 }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Commandes en attente</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{commandesEnAttente.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des commandes…</Text>
          </View>
        ) : commandesEnAttente.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={52} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>Aucune commande en attente</Text>
            <Text style={styles.emptySub}>Toutes les commandes ont été traitées.</Text>
          </View>
        ) : (
          <FlatList
            data={commandesEnAttente}
            keyExtractor={i => i.id_commande.toString()}
            renderItem={({ item }) => (
              <CommandeCard item={item} onPress={(cmd) => setCmdSelectionnee(cmd)} />
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
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  countBadge: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 12, fontWeight: '900', color: COLORS.warning },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.light,
  },
  cmdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cmdId: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  statutPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  statutText: { fontSize: 11, fontWeight: '700' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  clientAvatar: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center', justifyContent: 'center',
  },
  clientAvatarText: { fontSize: 12, fontWeight: '900', color: COLORS.primary },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  clientPhone: { fontSize: 12, color: COLORS.text.secondary },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11, color: COLORS.text.disabled },
  prix: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { ...(TYPOGRAPHY?.h3 || { fontSize: 18, fontWeight: '800', color: COLORS.text.primary }) },
  modalScroll: { padding: SPACING.md },
  modalSection: { marginBottom: SPACING.lg },
  modalSectionTitle: {
    fontSize: 11, fontWeight: '800', textTransform: 'uppercase',
    color: COLORS.text.secondary, marginBottom: SPACING.sm, letterSpacing: 1,
  },
  modalInfoCard: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    padding: SPACING.md, gap: SPACING.xs,
  },
  modalInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  modalInfoText: { fontSize: 14, color: COLORS.text.primary, flex: 1 },
  callBtnLarge: {
    backgroundColor: COLORS.success, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8, marginTop: SPACING.sm,
  },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalProduits: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20 },
  modalTotal: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginTop: SPACING.sm },
  actionStatutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  actionStatutText: { fontSize: 15, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14, color: COLORS.text.secondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  emptySub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 30, paddingTop: SPACING.sm },
});