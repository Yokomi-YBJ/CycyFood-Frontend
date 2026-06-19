// app/admin/clients.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Skeleton } from '../../components/Skeleton';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const ClientsSkeleton = () => (
  <View style={{ padding: SPACING.md }}>
    {[1, 2, 3, 4].map(i => (
      <View key={i} style={styles.clientCard}>
        <View style={styles.clientLeft}>
          <Skeleton width={50} height={50} style={{ borderRadius: RADIUS.md }} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Skeleton width={80} height={20} style={{ borderRadius: RADIUS.full }} />
            <Skeleton width={100} height={20} style={{ borderRadius: RADIUS.full }} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

export default function AdminClients() {
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tri, setTri] = useState('depense');

  const fetchClients = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminClients, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setClients(data.clients);
    } catch (e) {
      showAlert({ title: 'Erreur', message: 'Impossible de charger la liste des clients.', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchClients(); }, []);

  const clientsTries = [...clients].sort((a, b) => {
    if (tri === 'depense')   return b.total_depense - a.total_depense;
    if (tri === 'commandes') return b.nb_commandes - a.nb_commandes;
    if (tri === 'nom')       return a.nom_user.localeCompare(b.nom_user);
    return 0;
  });

  const appeler = (tel) => {
    Linking.openURL(`tel:${tel}`).catch(() => 
      showAlert({ title: 'Erreur', message: 'Impossible d\'ouvrir le téléphone.', type: 'error' })
    );
  };

  const whatsapp = (tel) => {
    Linking.openURL(`whatsapp://send?phone=+237${tel}`)
      .catch(() => Linking.openURL(`https://wa.me/237${tel}`));
  };

  const renderClient = ({ item, index }) => {
    const initiales = `${item.nom_user[0]}${item.prenom_user[0]}`.toUpperCase();
    const isTop = index < 3;
    const medailles = ['🥇', '🥈', '🥉'];

    return (
      <View style={styles.clientCard}>
        <View style={styles.clientLeft}>
          <View style={[styles.avatar, isTop && { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.avatarText, isTop && { color: '#fff' }]}>{initiales}</Text>
          </View>
          {isTop && tri === 'depense' && <Text style={styles.medaille}>{medailles[index]}</Text>}
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientNom}>{item.nom_user} {item.prenom_user}</Text>
          <View style={styles.clientMeta}>
            <Ionicons name="location-outline" size={12} color={COLORS.text.secondary} />
            <Text style={styles.clientAdresse}>{item.adresse_user}</Text>
          </View>
          <View style={styles.clientStats}>
            <View style={[styles.statPill, { backgroundColor: '#2196F315' }]}>
              <Ionicons name="receipt-outline" size={12} color="#2196F3" />
              <Text style={[styles.statPillText, { color: '#2196F3' }]}>{item.nb_commandes} cmd(s)</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="cash-outline" size={12} color={COLORS.primary} />
              <Text style={[styles.statPillText, { color: COLORS.primary }]}>{item.total_depense.toLocaleString()} Fcfa</Text>
            </View>
          </View>
        </View>

        <View style={styles.clientActions}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => appeler(item.telephone)}>
            <Ionicons name="call" size={18} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D36615' }]} onPress={() => whatsapp(item.telephone)}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }} >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <Text style={styles.headerCount}>{clients.length} inscrits</Text>
      </View>

      <View style={styles.triRow}>
        {[
          { key: 'depense',   label: 'Top dépenses' },
          { key: 'commandes', label: 'Top commandes' },
          { key: 'nom',       label: 'Alphabétique' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.triPill, tri === t.key && styles.triPillActive]}
            onPress={() => setTri(t.key)}
          >
            <Text style={[styles.triPillText, tri === t.key && styles.triPillTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ClientsSkeleton />
        : <FlatList
            data={clientsTries}
            keyExtractor={item => item.id_user.toString()}
            renderItem={renderClient}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>Aucun client inscrit</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  headerCount: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '600' },

  triRow: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm },
  triPill: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.surface },
  triPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  triPillText: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary },
  triPillTextActive: { color: '#fff' },

  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.md, ...SHADOWS.light },
  clientLeft: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  medaille: { position: 'absolute', top: -8, right: -8, fontSize: 16 },
  clientInfo: { flex: 1 },
  clientNom: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginBottom: 4 },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  clientAdresse: { fontSize: 12, color: COLORS.text.secondary },
  clientStats: { flexDirection: 'row', gap: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statPillText: { fontSize: 11, fontWeight: '700' },
  clientActions: { gap: SPACING.sm },
  contactBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.text.secondary, fontWeight: '600' },
});
