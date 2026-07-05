// app/admin/client/[id].js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';
import { Skeleton } from '../../../components/Skeleton';
import { ENDPOINTS } from '../../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning,   bg: COLORS.warning + '15',   icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info,      bg: COLORS.info + '15',      icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0',        bg: '#9C27B015',             icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: COLORS.success,   bg: COLORS.success + '15',   icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: COLORS.error,     bg: COLORS.error + '15',     icon: 'close-circle-outline' },
};

const LABELS_ACTION = {
  confirmee:    'Confirmer',
  en_livraison: 'Mettre en livraison',
  livree:       'Marquer livrée',
  annulee:      'Annuler',
};

// Transitions valides selon le type de commande (avec ou sans livraison)
const getTransitions = (statut, avec_livraison) => {
  if (avec_livraison) {
    return {
      en_attente:   ['en_livraison', 'annulee'],
      en_livraison: ['livree', 'annulee'],
      confirmee:    ['en_livraison', 'annulee'],
      livree:       [],
      annulee:      [],
    }[statut] || [];
  }
  return {
    en_attente: ['confirmee', 'annulee'],
    confirmee:  ['annulee'],
    livree:     [],
    annulee:    [],
  }[statut] || [];
};

// Intersection des transitions possibles pour un ensemble de commandes sélectionnées
const transitionsCommunes = (commandesSelectionnees) => {
  if (commandesSelectionnees.length === 0) return [];
  const listes = commandesSelectionnees.map(c =>
    getTransitions(c.statut, c.avec_livraison === 1 || c.avec_livraison === true)
  );
  return listes.reduce((acc, liste) => acc.filter(s => liste.includes(s)));
};

function CommandeRow({ item, selectionne, onToggleSelect, onOuvrirActions }) {
  const cfg = STATUT_CFG[item.statut] || STATUT_CFG.en_attente;
  const aLivraison = item.avec_livraison === 1 || item.avec_livraison === true;
  const transitions = getTransitions(item.statut, aLivraison);
  const estSelectionnable = transitions.length > 0;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.checkboxZone}
        onPress={() => estSelectionnable && onToggleSelect(item.id_commande)}
        disabled={!estSelectionnable}
      >
        <View style={[
          styles.checkbox,
          selectionne && styles.checkboxActive,
          !estSelectionnable && styles.checkboxDisabled,
        ]}>
          {selectionne && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.rowBody} onPress={() => onOuvrirActions(item)} activeOpacity={0.75}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowId}>Commande N {item.id_commande}</Text>
          <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.produitsText} numberOfLines={2}>{item.produits_detail || 'Détails indisponibles'}</Text>

        <View style={styles.rowFooter}>
          <View style={styles.rowMeta}>
            <Ionicons name={aLivraison ? 'bicycle-outline' : 'storefront-outline'} size={12} color={COLORS.text.disabled} />
            <Text style={styles.metaText}>{aLivraison ? 'Livraison' : 'Retrait'}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatDateShort(item.date_commande)} {item.heure_commande?.slice(0, 5)}</Text>
          </View>
          <Text style={styles.prixText}>{Number(item.prix_commande).toLocaleString()} Fcfa</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const STATUT_FILTRE_LABELS = {
  en_attente:   'En attente',
  confirmee:    'Confirmée',
  en_livraison: 'En livraison',
  livree:       'Livrée',
  annulee:      'Annulée',
};

export default function ClientDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const { showAlert } = useAlert();

  // Le filtre reçu depuis l'écran précédent (ex: "en_attente") est appliqué
  // par défaut. L'admin peut l'élargir à "Toutes" via le bouton dédié.
  const [statutActif, setStatutActif] = useState(params.statutFiltre || null);

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selection, setSelection] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Synchronisation du filtre avec les paramètres de navigation (si on revient sur l'écran)
  useEffect(() => {
    if (params.statutFiltre !== statutActif) {
      setStatutActif(params.statutFiltre || null);
    }
  }, [params.statutFiltre]);

  // Requête filtrée directement côté serveur (?statut=...)
  const fetchCommandesClient = useCallback(async () => {
    try {
      const url = statutActif
        ? `${ENDPOINTS.adminCommandes}?statut=${statutActif}`
        : ENDPOINTS.adminCommandes;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') {
        const dsClient = data.commandes.filter(c => String(c.id_user) === String(params.id));
        setCommandes(dsClient);
      }
    } catch {
      showAlert({ title: 'Erreur', message: 'Impossible de charger les commandes du client.', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statutActif, token, params.id, showAlert]);

  // On recharge les données à chaque fois que l'écran devient actif (Focus)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCommandesClient();
    }, [fetchCommandesClient])
  );

  const onRefresh = useCallback(() => { 
    setRefreshing(true); 
    fetchCommandesClient(); 
  }, [fetchCommandesClient]);

  const toggleSelect = (id) => {
    setSelection(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toutSelectionner = () => {
    const selectionnables = commandes.filter(c => getTransitions(c.statut, c.avec_livraison).length > 0);
    if (selection.size === selectionnables.length && selectionnables.length > 0) {
      setSelection(new Set());
    } else {
      setSelection(new Set(selectionnables.map(c => c.id_commande)));
    }
  };

  const commandesSelectionnees = useMemo(
    () => commandes.filter(c => selection.has(c.id_commande)),
    [commandes, selection]
  );

  const actionsGroupeesDisponibles = useMemo(
    () => transitionsCommunes(commandesSelectionnees),
    [commandesSelectionnees]
  );

  const appliquerStatutUnique = async (id, statut) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.adminCommandes}/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchCommandesClient();
        showAlert({ title: 'Statut mis à jour', message: data.message, type: 'success' });
      } else {
        showAlert({ title: 'Erreur', message: data.message, type: 'error' });
      }
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de modifier la commande.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const ouvrirActionsCommande = (cmd) => {
    const aLivraison = cmd.avec_livraison === 1 || cmd.avec_livraison === true;
    const transitions = getTransitions(cmd.statut, aLivraison);
    if (transitions.length === 0) {
      showAlert({ title: `Commande N ${cmd.id_commande}`, message: 'Aucune action possible sur cette commande.', type: 'info' });
      return;
    }
    const proposerAction = (index) => {
      if (index >= transitions.length) return;
      const s = transitions[index];
      showAlert({
        title: `Commande N° ${cmd.id_commande}`,
        message: `${LABELS_ACTION[s]} cette commande ?`,
        type: 'warning',
        confirmText: LABELS_ACTION[s],
        cancelText: index < transitions.length - 1 ? 'Autre action' : 'Annuler',
        onConfirm: () => appliquerStatutUnique(cmd.id_commande, s),
        onCancel: () => proposerAction(index + 1),
      });
    };
    proposerAction(0);
  };

  const appliquerStatutGroupe = async (statut) => {
    if (selection.size === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch(ENDPOINTS.adminCommandesStatutGroupe, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selection), statut }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelection(new Set());
        fetchCommandesClient();
        showAlert({ title: 'Mise à jour groupée', message: data.message, type: 'success' });
      } else {
        showAlert({ title: 'Erreur', message: data.message, type: 'error' });
      }
    } catch {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de traiter la sélection.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmerActionGroupee = (statut) => {
    showAlert({
      title: `${LABELS_ACTION[statut]} ${selection.size} commande(s) ?`,
      message: 'Cette action sera appliquée à toutes les commandes sélectionnées et sera visible par le client.',
      type: 'warning',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm: () => appliquerStatutGroupe(statut),
    });
  };

  const appeler = () => {
    if (!params.telephone) return;
    Linking.openURL(`tel:${params.telephone}`).catch(() =>
      showAlert({ title: 'Erreur', message: "Impossible d'ouvrir le téléphone.", type: 'error' })
    );
  };

  const totalDepense = commandes
    .filter(c => c.statut !== 'annulee')
    .reduce((sum, c) => sum + Number(c.prix_commande || 0), 0);

  const selectionnablesCount = commandes.filter(c => getTransitions(c.statut, c.avec_livraison).length > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* En-tête client */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{params.nom} {params.prenom}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{params.adresse || 'Adresse inconnue'}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={appeler}>
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bandeau de filtre actif, avec possibilité explicite de l'étendre */}
        {statutActif ? (
          <View style={styles.filtreBanner}>
            <View style={styles.filtreBannerLeft}>
              <Ionicons name="filter" size={14} color={COLORS.primary} />
              <Text style={styles.filtreBannerText}>
                Filtré : {STATUT_FILTRE_LABELS[statutActif] || statutActif}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setSelection(new Set()); setStatutActif(null); }}>
              <Text style={styles.filtreBannerAction}>Voir toutes les commandes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          params.statutFiltre ? (
            <View style={styles.filtreBanner}>
              <View style={styles.filtreBannerLeft}>
                <Ionicons name="list" size={14} color={COLORS.text.secondary} />
                <Text style={styles.filtreBannerText}>Toutes les commandes</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelection(new Set()); setStatutActif(params.statutFiltre); }}>
                <Text style={styles.filtreBannerAction}>
                  Revenir au filtre {STATUT_FILTRE_LABELS[params.statutFiltre] || params.statutFiltre}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}

        {/* Résumé */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{commandes.length}</Text>
            <Text style={styles.summaryLabel}>Commandes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{totalDepense.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Fcfa dépensés</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{commandes.filter(c => c.statut === 'en_attente').length}</Text>
            <Text style={styles.summaryLabel}>En attente</Text>
          </View>
        </View>

        {/* Barre de sélection */}
        {selectionnablesCount > 0 && (
          <View style={styles.selectionBar}>
            <TouchableOpacity style={styles.selectAllBtn} onPress={toutSelectionner}>
              <Ionicons
                name={selection.size === selectionnablesCount && selection.size > 0 ? 'checkbox' : 'square-outline'}
                size={18} color={COLORS.primary}
              />
              <Text style={styles.selectAllText}>
                {selection.size > 0 ? `${selection.size} sélectionnée(s)` : 'Tout sélectionner'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={{ padding: SPACING.md, gap: SPACING.md }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.row, { padding: SPACING.md }]}>
                <Skeleton width="100%" height={80} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={commandes}
            keyExtractor={item => item.id_commande.toString()}
            renderItem={({ item }) => (
              <CommandeRow
                item={item}
                selectionne={selection.has(item.id_commande)}
                onToggleSelect={toggleSelect}
                onOuvrirActions={ouvrirActionsCommande}
              />
            )}
            contentContainerStyle={[styles.list, selection.size > 0 && { paddingBottom: 140 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={52} color={COLORS.text.disabled} />
                <Text style={styles.emptyText}>
                  {statutActif
                    ? `Aucune commande "${STATUT_FILTRE_LABELS[statutActif] || statutActif}" pour ce client`
                    : 'Aucune commande pour ce client'}
                </Text>
              </View>
            }
          />
        )}

        {/* Barre d'actions groupées (flottante) */}
        {selection.size > 0 && actionsGroupeesDisponibles.length > 0 && (
          <View style={styles.actionBar}>
            <Text style={styles.actionBarTitle}>
              Action sur {selection.size} commande{selection.size > 1 ? 's' : ''}
            </Text>
            <View style={styles.actionBarRow}>
              {actionsGroupeesDisponibles.map(s => {
                const cfg = STATUT_CFG[s];
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.actionChip, { backgroundColor: cfg.color }]}
                    onPress={() => confirmerActionGroupee(s)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name={cfg.icon} size={16} color="#fff" />
                        <Text style={styles.actionChipText}>{LABELS_ACTION[s]}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, padding: SPACING.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  callBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },

  filtreBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  filtreBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filtreBannerText: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary },
  filtreBannerAction: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  summaryRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md,
  },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center', ...SHADOWS.light,
  },
  summaryVal: { fontSize: 17, fontWeight: '900', color: COLORS.text.primary },
  summaryLabel: { fontSize: 10, color: COLORS.text.secondary, marginTop: 2, textAlign: 'center' },

  selectionBar: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm,
  },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  list: { padding: SPACING.md, paddingTop: SPACING.sm },
  row: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  checkboxZone: { padding: SPACING.md, justifyContent: 'center' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxDisabled: { opacity: 0.3 },
  rowBody: { flex: 1, padding: SPACING.md, paddingLeft: 0, gap: 6 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowId: { fontSize: 13, fontWeight: '800', color: COLORS.text.primary },
  statutPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  statutText: { fontSize: 10, fontWeight: '700' },
  produitsText: { fontSize: 12, color: COLORS.text.secondary, lineHeight: 17 },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: COLORS.text.disabled },
  metaDot: { fontSize: 11, color: COLORS.text.disabled },
  prixText: { fontSize: 14, fontWeight: '900', color: COLORS.primary },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },

  actionBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.md, paddingBottom: SPACING.lg,
    ...SHADOWS.heavy,
  },
  actionBarTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary, marginBottom: SPACING.sm },
  actionBarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10,
  },
  actionChipText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
