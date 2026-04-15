// app/admin/clients.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

export default function AdminClients() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tri, setTri] = useState('depense'); // 'depense' | 'commandes' | 'nom'

  const fetchClients = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminClients, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setClients(data.clients);
    } catch (e) {
      Alert.alert('Problème de connexion', 'Impossible de charger la liste des clients.');
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
    Linking.openURL(`tel:${tel}`).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le téléphone.'));
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
          <View style={[styles.avatar, isTop && { backgroundColor: '#FF6B35' }]}>
            <Text style={styles.avatarText}>{initiales}</Text>
          </View>
          {isTop && tri === 'depense' && (
            <Text style={styles.medaille}>{medailles[index]}</Text>
          )}
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientNom}>{item.nom_user} {item.prenom_user}</Text>
          <View style={styles.clientMeta}>
            <Ionicons name="location-outline" size={11} color="#aaa" />
            <Text style={styles.clientAdresse}>{item.adresse_user}</Text>
          </View>
          <View style={styles.clientStats}>
            <View style={styles.statPill}>
              <Ionicons name="receipt-outline" size={10} color="#2196F3" />
              <Text style={[styles.statPillText, { color: '#2196F3' }]}>{item.nb_commandes} commande(s)</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: '#FF6B3510' }]}>
              <Ionicons name="cash-outline" size={10} color="#FF6B35" />
              <Text style={[styles.statPillText, { color: '#FF6B35' }]}>{item.total_depense.toLocaleString()} Fcfa</Text>
            </View>
          </View>
        </View>

        <View style={styles.clientActions}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => appeler(item.telephone)}>
            <Ionicons name="call" size={16} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D36618' }]} onPress={() => whatsapp(item.telephone)}>
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
    <View style={styles.containt}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <Text style={styles.headerCount}>{clients.length} inscrits</Text>
      </View>

      {/* Tri */}
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
        ? <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        : <FlatList
            data={clientsTries}
            keyExtractor={item => item.id_user.toString()}
            renderItem={renderClient}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
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
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  headerCount: { fontSize: 14, color: '#aaa', fontWeight: '600' },

  triRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  triPill: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  triPillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  triPillText: { fontSize: 12, fontWeight: '700', color: '#555' },
  triPillTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 20 },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  clientLeft: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  medaille: { position: 'absolute', top: -6, right: -6, fontSize: 14 },
  clientInfo: { flex: 1 },
  clientNom: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 3 },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  clientAdresse: { fontSize: 11, color: '#aaa' },
  clientStats: { flexDirection: 'row', gap: 6 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2196F310', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statPillText: { fontSize: 10, fontWeight: '700' },
  clientActions: { gap: 8 },
  contactBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#4CAF5018', alignItems: 'center', justifyContent: 'center' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
});
