// app/admin/commandes.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
  Modal, ScrollView, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const STATUTS = [
  { key: null,           label: 'Toutes',       color: COLORS.text.secondary },
  { key: 'en_attente',   label: 'En attente',   color: COLORS.warning },
  { key: 'confirmee',    label: 'Confirmée',    color: COLORS.info },
  { key: 'en_livraison', label: 'En livraison', color: COLORS.secondary },
  { key: 'livree',       label: 'Livrée',       color: COLORS.success },
  { key: 'annulee',      label: 'Annulée',      color: COLORS.error },
];

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: COLORS.warning, bg: COLORS.warning + '15', icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: COLORS.info, bg: COLORS.info + '15', icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: COLORS.secondary, bg: COLORS.secondary + '15', icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: COLORS.success, bg: COLORS.success + '15', icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: COLORS.error, bg: COLORS.error + '15', icon: 'close-circle-outline' },
};

const CommandesSkeleton = () => (
  <View style={{ padding: SPACING.md }}>
    {[1, 2, 3].map(i => (
      <View key={i} style={[styles.cmdCard, { gap: 12 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={80} height={16} />
          <Skeleton width={80} height={24} style={{ borderRadius: RADIUS.full }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Skeleton width={36} height={36} style={{ borderRadius: RADIUS.md }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 4 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={120} height={12} />
          <Skeleton width={60} height={16} />
        </View>
      </View>
    ))}
  </View>
);

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

export default function AdminCommandes() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState(null);
  const [cmdSelectionnee, setCmdSelectionnee] = useState(null);
  const [noteAdmin, setNoteAdmin] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const changerStatut = async (id, statut) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.adminCommandes}/${id}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut, note_admin: noteAdmin }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCmdSelectionnee(null);
        setNoteAdmin('');
        fetchCommandes();
      } else {
        showAlert({ title: 'Erreur', message: data.message, type: 'error' });
      }
    } catch (e) {
      showAlert({ title: 'Erreur réseau', message: 'Impossible de modifier la commande.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const appelerClient = (telephone) => {
    Linking.openURL(`tel:${telephone}`)
      .catch(() => showAlert({ title: 'Erreur', message: 'Impossible d\'ouvrir le téléphone.', type: 'error' }));
  };

  const renderCommande = ({ item }) => {
    const cfg = STATUT_CFG[item.statut] || STATUT_CFG.en_attente;
    const aLivraison = item.avec_livraison === 1 || item.avec_livraison === true;

    return (
      <TouchableOpacity
        style={styles.cmdCard}
        onPress={() => { setCmdSelectionnee(item); setNoteAdmin(item.note_admin || ''); }}
        activeOpacity={0.8}
      >
        <View style={styles.cmdHeader}>
          <Text style={styles.cmdId}>Commande #{item.id_commande}</Text>
          <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.clientRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {(item.nom_user[0] + item.prenom_user[0]).toUpperCase()}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientNom}>{item.nom_user} {item.prenom_user}</Text>
            <Text style={styles.clientAdresse}>
              <Ionicons name="location-outline" size={12} color={COLORS.text.secondary} /> {item.adresse_user}
            </Text>
          </View>
        </View>

        <View style={styles.cmdFooter}>
          <Text style={styles.cmdDate}>{item.date_commande} · {item.heure_commande?.slice(0, 5)}</Text>
          <Text style={styles.cmdPrix}>{item.prix_commande} Fcfa</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.text.primary} />
      
      <Modal visible={!!cmdSelectionnee} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {cmdSelectionnee && (() => {
              const aLivraison  = cmdSelectionnee.avec_livraison === 1 || cmdSelectionnee.avec_livraison === true;
              const transitions = getTransitions(cmdSelectionnee.statut, aLivraison);

              return (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Commande #{cmdSelectionnee.id_commande}</Text>
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
                          <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                          <Text style={styles.modalInfoText}>{cmdSelectionnee.adresse_user}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.callBtnLarge} onPress={() => appelerClient(cmdSelectionnee.telephone_client)}>
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
                          const cfg = STATUT_CFG[s];
                          return (
                            <TouchableOpacity
                              key={s}
                              style={[styles.actionStatutBtn, { borderColor: cfg.color, backgroundColor: cfg.bg }]}
                              onPress={() => {
                                showAlert({
                                  title: `Passer en "${cfg.label}" ?`,
                                  message: 'Cette action sera visible par le client.',
                                  type: 'warning',
                                  confirmText: 'Confirmer',
                                  onConfirm: () => changerStatut(cmdSelectionnee.id_commande, s),
                                });
                              }}
                              disabled={actionLoading}
                            >
                              <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                              <Text style={[styles.actionStatutText, { color: cfg.color }]}>
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
        <Text style={styles.headerTitle}>Commandes</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchCommandes(); }}>
          <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtresContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtresScroll}
        >
          {STATUTS.map(s => (
            <TouchableOpacity
              key={String(s.key)}
              style={[styles.filtrePill, filtreStatut === s.key && { backgroundColor: s.color, borderColor: s.color }]}
              onPress={() => setFiltreStatut(s.key)}
            >
              <Text style={[styles.filtrePillText, filtreStatut === s.key && { color: '#fff' }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading
        ? <CommandesSkeleton />
        : <FlatList
            data={commandes}
            keyExtractor={item => item.id_commande.toString()}
            renderItem={renderCommande}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune commande trouvée</Text>
              </View>
            }
          />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  
  filtresContainer: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filtresScroll: { padding: SPACING.md, gap: SPACING.sm },
  filtrePill: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface },
  filtrePillText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },

  list: { padding: SPACING.md },
  cmdCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm, ...SHADOWS.light },
  cmdHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cmdId: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  statutPill: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statutText: { fontSize: 11, fontWeight: '700' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  clientAvatar: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontSize: 12, fontWeight: '900', color: COLORS.primary },
  clientInfo: { flex: 1 },
  clientNom: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  clientAdresse: { fontSize: 12, color: COLORS.text.secondary },
  cmdPrix: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { ...TYPOGRAPHY.h3 },
  modalScroll: { padding: SPACING.md },
  modalSectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', color: COLORS.text.secondary, marginBottom: SPACING.sm },
  modalInfoCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.xs },
  modalInfoText: { fontSize: 14 },
  callBtnLarge: { backgroundColor: COLORS.success, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  callBtnText: { color: '#fff', fontWeight: '700' },
  actionStatutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  actionStatutText: { fontSize: 15, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
});
