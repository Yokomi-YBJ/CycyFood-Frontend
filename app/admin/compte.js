// app/admin/compte.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export default function AdminCompte() {
  const { user, deconnexion } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleDeconnexion = () => {
    showAlert({
      title: 'Déconnexion',
      message: 'Quitter l\'espace administrateur ?',
      type: 'warning',
      confirmText: 'Se déconnecter',
      onConfirm: async () => {
        await deconnexion();
        router.replace('/auth/login');
      },
    });
  };

  const MenuItem = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color || COLORS.primary) + '15' }]}>
        <Ionicons name={icon} size={20} color={color || COLORS.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.text.disabled} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header admin */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.nom}>{user?.nom_user}</Text>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
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
            <MenuItem icon="grid-outline"       label="Tableau de bord"  color={COLORS.primary} onPress={() => router.push('/admin')} />
            <View style={styles.divider} />
            <MenuItem icon="receipt-outline"    label="Commandes"        color="#2196F3" onPress={() => router.push('/admin/commandes')} />
            <View style={styles.divider} />
            <MenuItem icon="restaurant-outline" label="Produits"         color="#4CAF50" onPress={() => router.push('/admin/produits')} />
            <View style={styles.divider} />
            <MenuItem icon="people-outline"     label="Clients"          color="#9C27B0" onPress={() => router.push('/admin/clients')} />
          </View>
        </View>

        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.btnDeconnexionText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xl },
  header: { alignItems: 'center', paddingVertical: SPACING.xxl, backgroundColor: COLORS.text.primary },
  avatar: { width: 90, height: 90, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, ...SHADOWS.medium },
  nom: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary + '40' },
  adminBadgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: SPACING.sm },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.light },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  menuIcon: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  menuValue: { fontSize: 13, color: COLORS.text.secondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 72 },

  btnDeconnexion: { marginHorizontal: SPACING.md, marginTop: SPACING.xl, backgroundColor: COLORS.error, borderRadius: RADIUS.lg, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOWS.medium },
  btnDeconnexionText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
