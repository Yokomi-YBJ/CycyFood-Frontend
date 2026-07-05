// app/(tabs)/profil/index.js
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useAlert } from '../../../context/AlertContext';
import { useTranslation } from '../../../context/LanguageContext';
import { useConfig } from '../../../context/ConfigContext';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../constants/theme';

// ── Composant ligne de menu ──────────────────────────────
function MenuItem({ icon, iconBg, label, value, color, onPress, rightEl }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg || (color || COLORS.primary) + '15' }]}>
        <Ionicons name={icon} size={19} color={color || COLORS.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value ? <Text style={styles.menuValue} numberOfLines={1}>{value}</Text> : null}
      </View>
      {rightEl ? rightEl : onPress
        ? <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
        : null}
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const { user, deconnexion } = useAuth();
  const { totalArticles } = useCart();
  const { showAlert } = useAlert();
  const { t, locale, changeLocale } = useTranslation();
  const { config } = useConfig();
  const router = useRouter();

  const initiales = user
    ? `${(user.prenom_user || user.nom_user || '?')[0]}${(user.nom_user || '?')[0]}`.toUpperCase()
    : '??';

  const handleDeconnexion = () => {
    showAlert({
      title: t('logout'),
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      type: 'warning',
      confirmText: t('logout'),
      cancelText: 'Annuler',
      onConfirm: async () => {
        await deconnexion();
        router.replace('/auth/login');
      },
    });
  };

  const ouvrirWhatsApp = () => {
    const numero = config.customer_service_number;
    if (!numero) {
      showAlert({
        title: 'Erreur',
        message: 'Numéro de service client non configuré.',
        type: 'error',
      });
      return;
    }
    Linking.openURL(`whatsapp://send?phone=${numero}`)
      .catch(() => Linking.openURL(`https://wa.me/${numero}`));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── HEADER PROFIL ────────────────────────────── */}
        <View style={styles.profileHeader}>
          {/* Cercles déco */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initiales}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.prenom_user} {user?.nom_user}
          </Text>
          <View style={styles.userTagRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.userTag}>{user?.adresse_user || 'Ngaoundéré'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('profil/modifier')}
          >
            <Ionicons name="pencil-outline" size={13} color="#fff" />
            <Text style={styles.editBtnText}>{t('edit_info')}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── STATS ────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { icon: 'bag-outline', val: totalArticles, label: 'Panier', color: COLORS.primary },
            { icon: 'receipt-outline', val: '—', label: 'Commandes', color: COLORS.secondary },
            { icon: 'star-outline', val: '0', label: 'Points', color: COLORS.accent },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statVal}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── MES INFORMATIONS ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('info')}</Text>
          <View style={styles.card}>
            <MenuItem
              icon="call-outline"
              label={t('phone')}
              value={user?.telephone?.toString()}
              color={COLORS.info}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="location-outline"
              label={t('address')}
              value={user?.adresse_user}
              color={COLORS.secondary}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="create-outline"
              label={t('edit_info')}
              color={COLORS.primary}
              onPress={() => router.push('profil/modifier')}
            />
          </View>
        </View>

        {/* ─── LANGUE ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="language-outline" size={19} color={COLORS.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('language')}</Text>
              </View>
              {/* Toggle FR / EN */}
              <View style={styles.langToggleRow}>
                <TouchableOpacity
                  style={[styles.langChip, locale === 'fr' && styles.langChipActive]}
                  onPress={() => changeLocale('fr')}
                >
                  <Text style={[styles.langChipText, locale === 'fr' && styles.langChipTextActive]}>
                    FR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langChip, locale === 'en' && styles.langChipActive]}
                  onPress={() => changeLocale('en')}
                >
                  <Text style={[styles.langChipText, locale === 'en' && styles.langChipTextActive]}>
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ─── SUPPORT ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          <View style={styles.card}>
            <MenuItem
              icon="logo-whatsapp"
              label={t('contact_us')}
              value="Service client · WhatsApp"
              color="#25D366"
              onPress={ouvrirWhatsApp}
            />
          </View>
        </View>

        {/* ─── LÉGAL ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('legal')}</Text>
          <View style={styles.card}>
            <MenuItem
              icon="document-text-outline"
              label={t('cgu')}
              color={COLORS.info}
              onPress={() => router.push('profil/cgu')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-checkmark-outline"
              label={t('privacy')}
              color="#9C27B0"
              onPress={() => router.push('profil/confidentialite')}
            />
          </View>
        </View>

        {/* ─── À PROPOS ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about')}</Text>
          <View style={styles.card}>
            <MenuItem
              icon="information-circle-outline"
              label={t('version')}
              value="1.0.0"
              color={COLORS.text.disabled}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="code-slash-outline"
              label={t('developed_by')}
              value="Yokomi Beyea J."
              color={COLORS.text.disabled}
            />
          </View>
        </View>

        {/* ─── DÉCONNEXION ──────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleDeconnexion}>
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            </View>
            <Text style={styles.logoutText}>{t('logout')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.error + '80'} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },

  // Header profil
  profileHeader: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  headerDecor2: {
    position: 'absolute', bottom: -30, left: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName: {
    fontSize: 22, fontWeight: '800', color: '#fff',
    marginBottom: 4, letterSpacing: -0.3,
  },
  userTagRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: SPACING.md },
  userTag: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  editBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statIconWrap: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 18, fontWeight: '900', color: COLORS.text.primary },
  statLabel: { fontSize: 10, color: COLORS.text.secondary, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    overflow: 'hidden', ...SHADOWS.light,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  menuValue: { fontSize: 12, color: COLORS.text.secondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 70 },

  // Langue toggle
  langToggleRow: { flexDirection: 'row', gap: 6 },
  langChip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.full, backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  langChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langChipText: { fontSize: 12, fontWeight: '800', color: COLORS.text.secondary },
  langChipTextActive: { color: '#fff' },

  // Déconnexion
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.error + '25',
    ...SHADOWS.light,
  },
  logoutIconWrap: {
    width: 38, height: 38, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.error + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: {
    flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.error,
  },
});
