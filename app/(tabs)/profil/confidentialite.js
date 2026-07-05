// app/(tabs)/profil/confidentialite.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../../context/ConfigContext';
import { useAlert } from '../../../context/AlertContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../../constants/theme';

export default function ConfidentialiteScreen() {
  const router = useRouter();
  const { config } = useConfig();
  const { showAlert } = useAlert();
  const [ouverts, setOuverts] = useState({ 0: true });

  const SECTIONS = [
    {
      titre: '1. Responsable du traitement',
      icone: 'business-outline',
      contenu: `Le responsable du traitement de vos données personnelles est :\n\nLaTchop\nService de restauration rapide\nNgaoundéré, Région de l'Adamaoua — Cameroun\nContact : ${config.customer_service_number} (WhatsApp)\n\nLaTchop s'engage à protéger vos données personnelles conformément aux principes du Règlement Général sur la Protection des Données (RGPD) et aux lois applicables au Cameroun.`,
    },
    {
      titre: '2. Données collectées',
      icone: 'list-outline',
      contenu: `Nous collectons uniquement les données nécessaires au bon fonctionnement du service :\n\nDonnées d'identification :\n• Nom et prénom\n• Numéro de téléphone\n• Quartier de résidence\n• Mot de passe (chiffré et non lisible)\n\nDonnées de commande :\n• Historique des commandes\n• Produits commandés\n• Montants et dates des commandes\n\nDonnées techniques :\n• Type d'appareil utilisé\n• Version de l'application\n• Logs de connexion (à des fins de sécurité)\n\nNous ne collectons pas de données de géolocalisation en temps réel, ni de données bancaires.`,
    },
    {
      titre: '3. Finalités du traitement',
      icone: 'list-outline',
      contenu: `Les données collectées sont utilisées exclusivement pour :\n\n• La gestion de vos commandes.\n• La communication liée au statut de vos commandes (via WhatsApp).\n• La sécurité et l'amélioration de l'application.\n• La gestion de votre compte utilisateur.`,
    },
    {
      titre: '4. Conservation des données',
      icone: 'time-outline',
      contenu: `Nous conservons vos données aussi longtemps que votre compte est actif. Vous pouvez à tout moment demander la suppression de votre compte en nous contactant via le service client.`,
    },
  ];

  const toggle = (i) => setOuverts(prev => ({ ...prev, [i]: !prev[i] }));

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <View style={{ flex: 1, backgroundColor: '#fff' }} >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confidentialité</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle(i)}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name={s.icone} size={20} color="#FF6B35" />
                <Text style={styles.sectionTitle}>{s.titre}</Text>
              </View>
              <Ionicons name={ouverts[i] ? 'chevron-up' : 'chevron-down'} size={20} color="#555" />
            </TouchableOpacity>
            {ouverts[i] && <Text style={styles.sectionText}>{s.contenu}</Text>}
          </View>
        ))}
        <TouchableOpacity style={styles.contactBtn} onPress={ouvrirWhatsApp}>
            <Text style={styles.contactBtnText}>Contactez le support</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FF6B35' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, ...SHADOWS.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  sectionText: { marginTop: 10, fontSize: 14, color: '#666', lineHeight: 22 },
  contactBtn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  contactBtnText: { color: '#fff', fontWeight: '700' }
});
