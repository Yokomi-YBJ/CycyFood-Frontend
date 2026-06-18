// app/profil/confidentialite.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SECTIONS = [
  {
    titre: '1. Responsable du traitement',
    icone: 'business-outline',
    contenu: `Le responsable du traitement de vos données personnelles est :\n\nLaTchop\nService de restauration rapide\nNgaoundéré, Région de l'Adamaoua — Cameroun\nContact : +237 691 09 40 48 (WhatsApp)\n\nLaTchop s'engage à protéger vos données personnelles conformément aux principes du Règlement Général sur la Protection des Données (RGPD) et aux lois applicables au Cameroun.`,
  },
  {
    titre: '2. Données collectées',
    icone: 'list-outline',
    contenu: `Nous collectons uniquement les données nécessaires au bon fonctionnement du service :\n\nDonnées d'identification :\n• Nom et prénom\n• Numéro de téléphone\n• Quartier de résidence\n• Mot de passe (chiffré et non lisible)\n\nDonnées de commande :\n• Historique des commandes\n• Produits commandés\n• Montants et dates des commandes\n\nDonnées techniques :\n• Type d'appareil utilisé\n• Version de l'application\n• Logs de connexion (à des fins de sécurité)\n\nNous ne collectons pas de données de géolocalisation en temps réel, ni de données bancaires.`,
  },
  {
    titre: '3. Finalités du traitement',
    icone: 'checkmark-circle-outline',
    contenu: `Vos données sont collectées et traitées pour les finalités suivantes :\n\n• Création et gestion de votre compte utilisateur\n• Traitement et suivi de vos commandes\n• Livraison de vos commandes à votre adresse\n• Communication relative à vos commandes (confirmations, notifications)\n• Amélioration de nos services et de l'Application\n• Respect de nos obligations légales et réglementaires\n• Prévention des fraudes et sécurisation du service\n\nNous ne traitons jamais vos données à des fins incompatibles avec ces finalités sans votre consentement explicite.`,
  },
  {
    titre: '4. Base légale du traitement',
    icone: 'scale-outline',
    contenu: `Chaque traitement de données repose sur une base légale :\n\n• Exécution du contrat : traitement des commandes, gestion du compte\n• Intérêt légitime : amélioration du service, sécurité\n• Obligation légale : conservation des données comptables\n• Consentement : communications marketing (si applicable)\n\nVous pouvez retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.`,
  },
  {
    titre: '5. Durée de conservation',
    icone: 'time-outline',
    contenu: `Nous conservons vos données personnelles pendant :\n\n• Données de compte actif : toute la durée de votre relation avec LaTchop\n• Données de commandes : 5 ans à compter de la commande (obligations légales)\n• Données de connexion : 12 mois maximum\n• Données de compte supprimé : 30 jours puis suppression définitive\n\nAu-delà de ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`,
  },
  {
    titre: '6. Partage et destinataires',
    icone: 'people-outline',
    contenu: `Vos données personnelles ne sont jamais vendues à des tiers.\n\nNous pouvons partager vos données avec :\n• Nos livreurs, uniquement pour les données nécessaires à la livraison (nom, adresse, téléphone)\n• Les autorités compétentes en cas d'obligation légale\n\nAucun transfert de données vers des pays tiers n'est effectué.`,
  },
  {
    titre: '7. Vos droits',
    icone: 'hand-left-outline',
    contenu: `Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :\n\n• Droit d'accès : obtenir une copie de vos données\n• Droit de rectification : corriger vos données inexactes\n• Droit à l'effacement : demander la suppression de vos données\n• Droit d'opposition : vous opposer à certains traitements\n• Droit à la portabilité : récupérer vos données dans un format lisible\n• Droit à la limitation : restreindre temporairement le traitement\n\nPour exercer ces droits, contactez-nous par WhatsApp au +237 691 09 40 48. Nous nous engageons à répondre dans un délai de 30 jours.`,
  },
  {
    titre: '8. Sécurité des données',
    icone: 'shield-checkmark-outline',
    contenu: `LaTchop met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, divulgation, altération ou destruction :\n\n• Chiffrement des mots de passe (bcrypt)\n• Authentification par token JWT à durée limitée\n• Communications chiffrées (HTTPS)\n• Accès restreint aux données par le personnel autorisé uniquement\n• Revue régulière des pratiques de sécurité\n\nEn cas de violation de données susceptible d'affecter vos droits, vous en serez notifié dans les délais légaux applicables.`,
  },
  {
    titre: '9. Cookies et traceurs',
    icone: 'eye-outline',
    contenu: `L'Application mobile LaTchop n'utilise pas de cookies au sens traditionnel du terme.\n\nDes données de session sont stockées localement sur votre appareil (token d'authentification sécurisé) pour maintenir votre connexion. Ces données ne sont pas partagées avec des tiers.\n\nAucun outil de tracking publicitaire ou analytique tiers n'est intégré à l'Application.`,
  },
  {
    titre: '10. Modifications de la politique',
    icone: 'refresh-outline',
    contenu: `Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment pour l'adapter à des évolutions légales, techniques ou de service.\n\nToute modification substantielle vous sera notifiée via l'Application avant son entrée en vigueur. L'utilisation continue de l'Application après notification vaut acceptation de la nouvelle politique.\n\nDate de dernière mise à jour : Mars 2026\nVersion : 1.0`,
  },
];

export default function ConfidentialiteScreen() {
  const router = useRouter();
  const [ouverts, setOuverts] = useState({ 0: true });

  const toggle = (i) => setOuverts(prev => ({ ...prev, [i]: !prev[i] }));

  const ouvrirWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+237691094048')
      .catch(() => Linking.openURL('https://wa.me/237691094048'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <View style={styles.containt}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confidentialité</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.heroBanner}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={36} color="#FF6B35" />
            </View>
            <Text style={styles.heroTitle}>Politique de confidentialité</Text>
            <Text style={styles.heroSub}>En vigueur depuis mars 2026 · Version 1.0</Text>
          </View>

          <View style={styles.engagementCard}>
            <Ionicons name="heart" size={18} color="#FF6B35" style={{ marginTop: 2 }} />
            <Text style={styles.engagementText}>
              Chez LaTchop, la protection de votre vie privée est une priorité. Nous collectons le strict minimum nécessaire pour vous servir et améliorer continuellement votre expérience.
            </Text>
          </View>

          {SECTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.sectionCard, ouverts[i] && styles.sectionCardOpen]}
              onPress={() => toggle(i)}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionHeader, ouverts[i] && styles.sectionHeaderOpen]}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name={s.icone} size={18} color="#FF6B35" />
                </View>
                <Text style={styles.sectionTitre}>{s.titre}</Text>
                <Ionicons name={ouverts[i] ? 'chevron-up' : 'chevron-down'} size={18} color="#FF6B35" />
              </View>
              {ouverts[i] && (
                <View style={styles.sectionContenuWrapper}>
                  <Text style={styles.sectionContenu}>{s.contenu}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Contact DPO */}
          <TouchableOpacity style={styles.contactCard} onPress={ouvrirWhatsApp} activeOpacity={0.8}>
            <View style={styles.contactIconWrap}>
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitre}>Exercer vos droits</Text>
              <Text style={styles.contactSub}>Contactez-nous sur WhatsApp pour toute demande relative à vos données</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FF6B35" />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' }, // SafeArea color
  containt: { flex: 1, backgroundColor: '#f9f9f9' }, // Background color like HTML
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eeeeee',
    shadowColor: '#FF6B35', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 2
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  scroll: { padding: 16 },

  heroBanner: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255, 107, 53, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 6, textAlign: 'center' },
  heroSub: { fontSize: 13, color: '#888' },

  engagementCard: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 28, 
    borderLeftWidth: 4, 
    borderLeftColor: '#FF6B35',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 8, 
    elevation: 1
  },
  engagementText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 22 },

  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 14, 
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1 
  },
  sectionCardOpen: {
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  sectionHeaderOpen: { borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 107, 53, 0.1)', alignItems: 'center', justifyContent: 'center' },
  sectionTitre: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  sectionContenuWrapper: { padding: 16, backgroundColor: '#fff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  sectionContenu: { fontSize: 14, color: '#555', lineHeight: 22 },

  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 20, 
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.15)',
    shadowColor: '#FF6B35', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 2 
  },
  contactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactInfo: { flex: 1 },
  contactTitre: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  contactSub: { fontSize: 13, color: '#888', lineHeight: 18 },
});