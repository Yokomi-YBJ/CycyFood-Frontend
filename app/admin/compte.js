// app/admin/compte.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminCompte() {
  const { user, deconnexion } = useAuth();
  const router = useRouter();

  const handleDeconnexion = () => {
    Alert.alert('Déconnexion', 'Quitter l\'espace administrateur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await deconnexion();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color || '#FF6B35') + '18' }]}>
        <Ionicons name={icon} size={20} color={color || '#FF6B35'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header admin */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={36} color="#FF6B35" />
          </View>
          <Text style={styles.nom}>{user?.nom_user}</Text>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#FF6B35" />
            <Text style={styles.adminBadgeText}>Administrateur</Text>
          </View>
        </View>

        {/* Infos compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.card}>
            <MenuItem icon="call-outline" label="Téléphone" value={user?.telephone?.toString()} />
          </View>
        </View>

        {/* Navigation rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion</Text>
          <View style={styles.card}>
            <MenuItem icon="grid-outline"       label="Tableau de bord"  color="#FF6B35" onPress={() => router.push('/admin')} />
            <View style={styles.divider} />
            <MenuItem icon="receipt-outline"    label="Commandes"        color="#2196F3" onPress={() => router.push('/admin/commandes')} />
            <View style={styles.divider} />
            <MenuItem icon="restaurant-outline" label="Produits"         color="#4CAF50" onPress={() => router.push('/admin/produits')} />
            <View style={styles.divider} />
            <MenuItem icon="people-outline"     label="Clients"          color="#9C27B0" onPress={() => router.push('/admin/clients')} />
          </View>
        </View>

        {/* Infos app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <View style={styles.card}>
            <MenuItem icon="information-circle-outline" label="Version" value="1.1.0 — Admin" color="#888" />
            <View style={styles.divider} />
            <MenuItem icon="code-slash-outline" label="Développé par" value="Yokomi Beyea J. & Mbanga David" color="#888" />
          </View>
        </View>

        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.btnDeconnexionText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#1a1a1a', marginBottom: 20 },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#FF6B3520', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#FF6B3540' },
  nom: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FF6B3520', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#FF6B3540' },
  adminBadgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  menuValue: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f2f2f2', marginLeft: 66 },

  btnDeconnexion: { marginHorizontal: 16, backgroundColor: '#f44336', borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#f44336', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  btnDeconnexionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
