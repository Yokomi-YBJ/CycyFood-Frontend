// app/(tabs)/profil/index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

export default function ProfilScreen() {
  const { user, deconnexion } = useAuth();
  const { totalArticles } = useCart();
  const router = useRouter();

  const handleDeconnexion = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await deconnexion();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const ouvrirWhatsApp = () => {
    const numero = '237691094048';
    Linking.openURL(`whatsapp://send?phone=+${numero}`)
      .catch(() => Linking.openURL(`https://wa.me/${numero}`));
  };

  const initiales = user
    ? `${(user.nom_user || '?')[0]}${(user.prenom_user || '?')[0]}`.toUpperCase()
    : '??';

  const MenuItem = ({ icon, label, value, color, onPress, chevron }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color || '#FF6B35') + '15' }]}>
        <Ionicons name={icon} size={20} color={color || '#FF6B35'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value ? <Text style={styles.menuValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      {(onPress || chevron) && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.containt}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initiales}</Text>
          </View>
          <Text style={styles.userName}>{user?.nom_user} {user?.prenom_user}</Text>
          
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => router.push('profil/modifier')}
          >
            <Ionicons name="pencil-outline" size={14} color="#fff" />
            <Text style={styles.editHeaderBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Mes informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes informations</Text>
          <View style={styles.card}>
            <MenuItem
              icon="call-outline"
              label="Téléphone"
              value={user?.telephone?.toString()}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="location-outline"
              label="Quartier"
              value={user?.adresse_user}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="create-outline"
              label="Modifier mes informations"
              color="#FF6B35"
              onPress={() => router.push('profil/modifier')}
              chevron
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🛒</Text>
            <Text style={styles.statVal}>{totalArticles}</Text>
            <Text style={styles.statLabel}>Panier</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={styles.statVal}>—</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎁</Text>
            <Text style={styles.statVal}>0</Text>
            <Text style={styles.statLabel}>Fidélité</Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <MenuItem
              icon="logo-whatsapp"
              label="Nous contacter"
              value="Service Client"
              color="#4CAF50"
              onPress={ouvrirWhatsApp}
            />
          </View>
        </View>

        {/* Légal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Légal</Text>
          <View style={styles.card}>
            <MenuItem
              icon="document-text-outline"
              label="Conditions Générales d'Utilisation"
              color="#2196F3"
              onPress={() => router.push('profil/cgu')}
              chevron
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-outline"
              label="Politique de confidentialité"
              color="#9C27B0"
              onPress={() => router.push('profil/confidentialite')}
              chevron
            />
          </View>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.card}>
            <MenuItem
              icon="information-circle-outline"
              label="Version"
              value="1.0.0"
              color="#888"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="code-slash-outline"
              label="Développé par"
              value="Yokomi Beyea J. & Mbanga David"
              color="#888"
            />
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.btnDeconnexionText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  profileHeader: {
    alignItems: 'center', paddingTop: 28, paddingBottom: 28,
    backgroundColor: '#FF6B35',
  },
  avatar: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 2 },
  editHeaderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  editHeaderBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  menuValue: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f2f2f2', marginLeft: 66 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#1a1a1a' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 2 },

  btnDeconnexion: {
    marginHorizontal: 16, marginTop: 24, backgroundColor: '#ff4444',
    borderRadius: 14, height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#ff4444', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnDeconnexionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
