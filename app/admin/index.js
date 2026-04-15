// app/admin/index.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

const STATUT_CONFIG = {
  en_attente:   { label: 'En attente',   color: '#FF9800', bg: '#FF980015', icon: 'time-outline' },
  confirmee:    { label: 'Confirmée',    color: '#2196F3', bg: '#2196F315', icon: 'checkmark-circle-outline' },
  en_livraison: { label: 'En livraison', color: '#9C27B0', bg: '#9C27B015', icon: 'bicycle-outline' },
  livree:       { label: 'Livrée',       color: '#4CAF50', bg: '#4CAF5015', icon: 'bag-check-outline' },
  annulee:      { label: 'Annulée',      color: '#f44336', bg: '#f4433615', icon: 'close-circle-outline' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const fetchStats = async () => {
    try {
      const res = await fetch(ENDPOINTS.adminStats, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStats(data.stats);
        setRecentes(data.commandes_recentes);
      }
    } catch (e) {
      console.error('Erreur stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchStats(); }, []);

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statVal}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
    <View style={styles.containt}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Espace administrateur</Text>
          <Text style={styles.headerTitle}>Bonjour, {user?.nom_user} 👑</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#FF6B35" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 60 }} />
        ) : stats ? (
          <>
            {/* Alerte commandes en attente */}
            {stats.en_attente > 0 && (
              <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/admin/commandes')}>
                <Ionicons name="alert-circle" size={20} color="#FF6B35" />
                <Text style={styles.alertText}>
                  {stats.en_attente} commande{stats.en_attente > 1 ? 's' : ''} en attente de traitement
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
              </TouchableOpacity>
            )}

            {/* Chiffre d'affaires */}
            <View style={styles.caCard}>
              <Text style={styles.caLabel}>Chiffre d'affaires total</Text>
              <Text style={styles.caVal}>{stats.chiffre_affaires.toLocaleString()} Fcfa</Text>
              <Text style={styles.caSub}>{stats.total_commandes} commandes au total</Text>
            </View>

            {/* Grille de stats */}
            <View style={styles.statsGrid}>
              <StatCard icon="time-outline"       label="En attente"    value={stats.en_attente}    color="#FF9800" onPress={() => router.push('/admin/commandes')} />
              <StatCard icon="checkmark-circle-outline" label="Confirmées" value={stats.confirmees} color="#2196F3" onPress={() => router.push('/admin/commandes')} />
              <StatCard icon="people-outline"     label="Clients"       value={stats.total_clients} color="#9C27B0" onPress={() => router.push('/admin/clients')} />
              <StatCard icon="restaurant-outline" label="Produits dispo" value={`${stats.produits_dispo}/${stats.total_produits}`} color="#4CAF50" onPress={() => router.push('/admin/produits')} />
            </View>

            {/* Commandes récentes */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Commandes récentes</Text>
                <TouchableOpacity onPress={() => router.push('/admin/commandes')}>
                  <Text style={styles.voirTout}>Voir tout </Text>
                </TouchableOpacity>
              </View>

              {recentes.map(cmd => {
                const cfg = STATUT_CONFIG[cmd.statut] || STATUT_CONFIG.en_attente;
                return (
                  <TouchableOpacity
                    key={cmd.id_commande}
                    style={styles.cmdCard}
                    onPress={() => router.push('/admin/commandes')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.cmdIconWrap, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                    </View>
                    <View style={styles.cmdInfo}>
                      <Text style={styles.cmdNom}>{cmd.nom_user} {cmd.prenom_user}</Text>
                      <Text style={styles.cmdHeure}>{cmd.heure_commande?.slice(0,5)} </Text>
                    </View>
                    <View style={styles.cmdRight}>
                      <Text style={styles.cmdPrix}>{cmd.prix_commande} Fcfa</Text>
                      <View style={[styles.statutPill, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statutPillText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions rapides */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <View style={styles.actionsGrid}>
                {[
                  { icon: 'add-circle-outline', label: 'Nouveau produit', color: '#4CAF50', route: '/admin/produits' },
                  { icon: 'receipt-outline',    label: 'Commandes',       color: '#2196F3', route: '/admin/commandes' },
                  { icon: 'people-outline',     label: 'Clients',         color: '#9C27B0', route: '/admin/clients' },
                  { icon: 'analytics-outline',  label: 'Statistiques',    color: '#FF6B35', route: null },
                ].map((a, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.actionCard}
                    onPress={() => a.route && router.push(a.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                      <Ionicons name={a.icon} size={26} color={a.color} />
                    </View>
                    <Text style={styles.actionLabel}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerSub: { fontSize: 12, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  adminBadge: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FF6B3515', alignItems: 'center', justifyContent: 'center' },

  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FF6B3512', borderRadius: 14, marginHorizontal: 16, marginBottom: 16, padding: 14, borderWidth: 1, borderColor: '#FF6B3530' },
  alertText: { flex: 1, fontSize: 13, color: '#FF6B35', fontWeight: '700' },

  caCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FF6B35', borderRadius: 20, padding: 24 },
  caLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  caVal: { fontSize: 34, fontWeight: '900', color: '#fff', marginBottom: 4 },
  caSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 1 },

  section: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  voirTout: { fontSize: 13, color: '#FF6B35', fontWeight: '700' },

  cmdCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cmdIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cmdInfo: { flex: 1 },
  cmdNom: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  cmdHeure: { fontSize: 12, color: '#888', marginTop: 2 },
  cmdRight: { alignItems: 'flex-end', gap: 4 },
  cmdPrix: { fontSize: 14, fontWeight: '800', color: '#FF6B35' },
  statutPill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statutPillText: { fontSize: 10, fontWeight: '700' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
});
