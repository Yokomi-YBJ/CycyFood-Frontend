// app/admin/commandes.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Linking,
  Modal, ScrollView, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

const STATUTS = [
  { key: null,           label: 'Toutes',       color: '#888' },
  { key: 'en_attente',   label: 'En attente',   color: '#FF9800' },
  { key: 'confirmee',    label: 'Confirmée',    color: '#2196F3' },
  { key: 'en_livraison', label: 'En livraison', color: '#9C27B0' },
  { key: 'livree',       label: 'Livrée',       color: '#4CAF50' },
  { key: 'annulee',      label: 'Annulée',      color: '#f44336' },
];

const STATUT_CFG = {
  en_attente:   { label: 'En attente',   color: '#FF9800', bg: '#FF980018', icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: '#2196F3', bg: '#2196F318', icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0', bg: '#9C27B018', icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: '#4CAF50', bg: '#4CAF5018', icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: '#f44336', bg: '#f4433618', icon: 'close-circle-outline' },
};

const TRANSITIONS = {
  en_attente:   ['confirmee', 'annulee'],
  confirmee:    ['en_livraison', 'annulee'],
  en_livraison: ['livree', 'annulee'],
  livree:       [],
  annulee:      [],
};

export default function AdminCommandes() {
  const { token } = useAuth();
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
      Alert.alert('Erreur', 'Impossible de charger les commandes.');
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
        Alert.alert('Erreur', data.message);
      }
    } catch (e) {
      Alert.alert('Erreur réseau', 'Impossible de modifier la commande.');
    } finally {
      setActionLoading(false);
    }
  };

  const appelerClient = (telephone) => {
    Linking.openURL(`tel:${telephone}`)
      .catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le téléphone.'));
  };

  const renderCommande = ({ item }) => {
    const cfg = STATUT_CFG[item.statut] || STATUT_CFG.en_attente;
    return (
      <TouchableOpacity
        style={styles.cmdCard}
        onPress={() => { setCmdSelectionnee(item); setNoteAdmin(item.note_admin || ''); }}
        activeOpacity={0.85}
      >
        {/* En-tête */}
        <View style={styles.cmdHeader}>
          <Text style={styles.cmdId}>Commande #{item.id_commande}</Text>
          <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            <Text style={[styles.statutText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {(item.nom_user[0] + item.prenom_user[0]).toUpperCase()}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientNom}>{item.nom_user} {item.prenom_user}</Text>
            <Text style={styles.clientAdresse}>
              <Ionicons name="location-outline" size={11} color="#aaa" /> {item.adresse_user}
            </Text>
          </View>
          {/* Bouton appel direct */}
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => appelerClient(item.telephone_client)}
          >
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Produits */}
        <View style={styles.produitsRow}>
          <Ionicons name="restaurant-outline" size={13} color="#aaa" />
          <Text style={styles.produitsText} numberOfLines={2}>{item.produits_detail}</Text>
        </View>

        {/* Footer */}
        <View style={styles.cmdFooter}>
          <Text style={styles.cmdDate}>
            {item.date_commande} · {item.heure_commande?.slice(0,5)}
          </Text>
          <Text style={styles.cmdPrix}>{item.prix_commande} Fcfa</Text>
        </View>

        {item.note_admin && (
          <View style={styles.noteRow}>
            <Ionicons name="create-outline" size={12} color="#888" />
            <Text style={styles.noteText}>{item.note_admin}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f8" />

      {/* Modal détail commande */}
      <Modal visible={!!cmdSelectionnee} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {cmdSelectionnee && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Commande #{cmdSelectionnee.id_commande}</Text>
                  <TouchableOpacity onPress={() => setCmdSelectionnee(null)}>
                    <Ionicons name="close" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScroll}>

                  {/* Infos client */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Client</Text>
                    <View style={styles.modalInfoCard}>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="person-outline" size={16} color="#FF6B35" />
                        <Text style={styles.modalInfoText}>{cmdSelectionnee.nom_user} {cmdSelectionnee.prenom_user}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location-outline" size={16} color="#FF6B35" />
                        <Text style={styles.modalInfoText}>{cmdSelectionnee.adresse_user}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="call-outline" size={16} color="#FF6B35" />
                        <Text style={styles.modalInfoText}>{cmdSelectionnee.telephone_client}</Text>
                      </View>
                    </View>

                    {/* Bouton appel */}
                    <TouchableOpacity
                      style={styles.callBtnLarge}
                      onPress={() => appelerClient(cmdSelectionnee.telephone_client)}
                    >
                      <Ionicons name="call" size={20} color="#fff" />
                      <Text style={styles.callBtnText}>Appeler le client</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Produits commandés */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Produits</Text>
                    <View style={styles.modalInfoCard}>
                      <Text style={styles.modalProduits}>{cmdSelectionnee.produits_detail}</Text>
                    </View>
                    <Text style={styles.modalTotal}>Total : {cmdSelectionnee.prix_commande} Fcfa</Text>
                  </View>

                  {/* Note admin */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Note interne (optionnel)</Text>
                    <View style={styles.noteInput}>
                      <TextInput
                        style={styles.noteInputField}
                        placeholder="Ex: client difficile à trouver..."
                        placeholderTextColor="#bbb"
                        value={noteAdmin}
                        onChangeText={setNoteAdmin}
                        multiline
                        numberOfLines={2}
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Actions statut */}
                  {TRANSITIONS[cmdSelectionnee.statut]?.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Changer le statut</Text>
                      {TRANSITIONS[cmdSelectionnee.statut].map(s => {
                        const cfg = STATUT_CFG[s];
                        return (
                          <TouchableOpacity
                            key={s}
                            style={[styles.actionStatutBtn, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                            onPress={() => {
                              Alert.alert(
                                `Passer en "${cfg.label}" ?`,
                                'Cette action sera visible par le client.',
                                [
                                  { text: 'Annuler', style: 'cancel' },
                                  { text: 'Confirmer', onPress: () => changerStatut(cmdSelectionnee.id_commande, s) },
                                ]
                              );
                            }}
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? <ActivityIndicator color={cfg.color} />
                              : <>
                                  <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                                  <Text style={[styles.actionStatutText, { color: cfg.color }]}>
                                    {s === 'confirmee'    && 'Confirmer la commande'}
                                    {s === 'en_livraison' && 'Mettre en livraison'}
                                    {s === 'livree'       && 'Marquer comme livrée'}
                                    {s === 'annulee'      && 'Annuler la commande'}
                                  </Text>
                                </>
                            }
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {(cmdSelectionnee.statut === 'livree' || cmdSelectionnee.statut === 'annulee') && (
                    <View style={styles.termineCard}>
                      <Ionicons name={cmdSelectionnee.statut === 'livree' ? 'checkmark-done-circle' : 'close-circle'} size={24} color={cmdSelectionnee.statut === 'livree' ? '#4CAF50' : '#f44336'} />
                      <Text style={[styles.termineText, { color: cmdSelectionnee.statut === 'livree' ? '#4CAF50' : '#f44336' }]}>
                        {cmdSelectionnee.statut === 'livree' ? 'Commande livrée — terminée' : 'Commande annulée'}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchCommandes(); }} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Filtres statut */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
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

      {loading
        ? <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        : <FlatList
            data={commandes}
            keyExtractor={item => item.id_commande.toString()}
            renderItem={renderCommande}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>Aucune commande{filtreStatut ? ` "${filtreStatut}"` : ''}</Text>
              </View>
            }
          />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  refreshBtn: { padding: 6 },
  filtres: { marginBottom: 4 },
  filtrePill: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff' },
  filtrePillText: { fontSize: 12, fontWeight: '700', color: '#555' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },

  cmdCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cmdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cmdId: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  statutPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statutText: { fontSize: 11, fontWeight: '700' },

  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  clientAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontSize: 13, fontWeight: '800', color: '#FF6B35' },
  clientInfo: { flex: 1 },
  clientNom: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  clientAdresse: { fontSize: 12, color: '#aaa', marginTop: 1 },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },

  produitsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  produitsText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },

  cmdFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cmdDate: { fontSize: 11, color: '#aaa' },
  cmdPrix: { fontSize: 15, fontWeight: '900', color: '#FF6B35' },

  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  noteText: { fontSize: 11, color: '#888', fontStyle: 'italic', flex: 1 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#aaa', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  modalScroll: { padding: 20 },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: { fontSize: 11, fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  modalInfoCard: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, gap: 10 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalInfoText: { fontSize: 14, color: '#333', fontWeight: '500' },
  callBtnLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#4CAF50', borderRadius: 14, height: 50, marginTop: 10, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalProduits: { fontSize: 14, color: '#333', lineHeight: 22 },
  modalTotal: { fontSize: 18, fontWeight: '900', color: '#FF6B35', marginTop: 10, textAlign: 'right' },
  noteInput: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fafafa', padding: 12 },
  noteInputField: { fontSize: 14, color: '#333', minHeight: 50 },
  actionStatutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 10 },
  actionStatutText: { fontSize: 15, fontWeight: '700' },
  termineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, backgroundColor: '#f8f8f8', borderRadius: 14 },
  termineText: { fontSize: 15, fontWeight: '700' },
});
