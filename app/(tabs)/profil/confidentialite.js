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
    contenu: `Le responsable du traitement de vos données personnelles est :

Cycy-Food
Service de restauration rapide
Ngaoundéré, Région de l'Adamaoua — Cameroun
Contact : +237 691 09 40 48 (WhatsApp)

Cycy-Food s'engage à protéger vos données personnelles conformément aux principes du Règlement Général sur la Protection des Données (RGPD) et aux lois applicables au Cameroun.`,
  },
  {
    titre: '2. Données collectées',
    icone: 'list-outline',
    contenu: `Nous collectons uniquement les données nécessaires au bon fonctionnement du service :

Données d'identification :
• Nom et prénom
• Numéro de téléphone
• Quartier de résidence
• Mot de passe (chiffré et non lisible)

Données de commande :
• Historique des commandes
• Produits commandés
• Montants et dates des commandes

Données techniques :
• Type d'appareil utilisé
• Version de l'application
• Logs de connexion (à des fins de sécurité)

Nous ne collectons pas de données de géolocalisation en temps réel, ni de données bancaires.`,
  },
  {
    titre: '3. Finalités du traitement',
    icone: 'checkmark-circle-outline',
    contenu: `Vos données sont collectées et traitées pour les finalités suivantes :

• Création et gestion de votre compte utilisateur
• Traitement et suivi de vos commandes
• Livraison de vos commandes à votre adresse
• Communication relative à vos commandes (confirmations, notifications)
• Amélioration de nos services et de l'Application
• Respect de nos obligations légales et réglementaires
• Prévention des fraudes et sécurisation du service

Nous ne traitons jamais vos données à des fins incompatibles avec ces finalités sans votre consentement explicite.`,
  },
  {
    titre: '4. Base légale du traitement',
    icone: 'scale-outline',
    contenu: `Chaque traitement de données repose sur une base légale :

• Exécution du contrat : traitement des commandes, gestion du compte
• Intérêt légitime : amélioration du service, sécurité
• Obligation légale : conservation des données comptables
• Consentement : communications marketing (si applicable)

Vous pouvez retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.`,
  },
  {
    titre: '5. Durée de conservation',
    icone: 'time-outline',
    contenu: `Nous conservons vos données personnelles pendant :

• Données de compte actif : toute la durée de votre relation avec Cycy-Food
• Données de commandes : 5 ans à compter de la commande (obligations légales)
• Données de connexion : 12 mois maximum
• Données de compte supprimé : 30 jours puis suppression définitive

Au-delà de ces délais, vos données sont supprimées ou anonymisées de manière irréversible.`,
  },
  {
    titre: '6. Partage et destinataires',
    icone: 'people-outline',
    contenu: `Vos données personnelles ne sont jamais vendues à des tiers.

Nous pouvons partager vos données avec :
• Nos livreurs, uniquement pour les données nécessaires à la livraison (nom, adresse, téléphone)
• Les autorités compétentes en cas d'obligation légale

Aucun transfert de données vers des pays tiers n'est effectué.`,
  },
  {
    titre: '7. Vos droits',
    icone: 'hand-left-outline',
    contenu: `Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données
• Droit de rectification : corriger vos données inexactes
• Droit à l'effacement : demander la suppression de vos données
• Droit d'opposition : vous opposer à certains traitements
• Droit à la portabilité : récupérer vos données dans un format lisible
• Droit à la limitation : restreindre temporairement le traitement

Pour exercer ces droits, contactez-nous par WhatsApp au +237 691 09 40 48. Nous nous engageons à répondre dans un délai de 30 jours.`,
  },
  {
    titre: '8. Sécurité des données',
    icone: 'shield-checkmark-outline',
    contenu: `Cycy-Food met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, divulgation, altération ou destruction :

• Chiffrement des mots de passe (bcrypt)
• Authentification par token JWT à durée limitée
• Communications chiffrées (HTTPS)
• Accès restreint aux données par le personnel autorisé uniquement
• Revue régulière des pratiques de sécurité

En cas de violation de données susceptible d'affecter vos droits, vous en serez notifié dans les délais légaux applicables.`,
  },
  {
    titre: '9. Cookies et traceurs',
    icone: 'eye-outline',
    contenu: `L'Application mobile Cycy-Food n'utilise pas de cookies au sens traditionnel du terme.

Des données de session sont stockées localement sur votre appareil (token d'authentification sécurisé) pour maintenir votre connexion. Ces données ne sont pas partagées avec des tiers.

Aucun outil de tracking publicitaire ou analytique tiers n'est intégré à l'Application.`,
  },
  {
    titre: '10. Modifications de la politique',
    icone: 'refresh-outline',
    contenu: `Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment pour l'adapter à des évolutions légales, techniques ou de service.

Toute modification substantielle vous sera notifiée via l'Application avant son entrée en vigueur. L'utilisation continue de l'Application après notification vaut acceptation de la nouvelle politique.

Date de dernière mise à jour : Mars 2026
Version : 1.0`,
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
            <Ionicons name="shield-checkmark" size={34} color="#9C27B0" />
          </View>
          <Text style={styles.heroTitle}>Politique de confidentialité</Text>
          <Text style={styles.heroSub}>En vigueur depuis mars 2026 · Version 1.0</Text>
        </View>

        <View style={styles.engagementCard}>
          <Ionicons name="heart" size={16} color="#9C27B0" />
          <Text style={styles.engagementText}>
            Chez Cycy-Food, la protection de votre vie privée est une priorité. Nous collectons le strict minimum nécessaire pour vous servir.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={styles.sectionCard}
            onPress={() => toggle(i)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name={s.icone} size={16} color="#9C27B0" />
              </View>
              <Text style={styles.sectionTitre}>{s.titre}</Text>
              <Ionicons name={ouverts[i] ? 'chevron-up' : 'chevron-down'} size={16} color="#9C27B0" />
            </View>
            {ouverts[i] && (
              <Text style={styles.sectionContenu}>{s.contenu}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact DPO */}
        <TouchableOpacity style={styles.contactCard} onPress={ouvrirWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#4CAF50" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitre}>Exercer vos droits</Text>
            <Text style={styles.contactSub}>Contactez-nous sur WhatsApp pour toute demande relative à vos données</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  scroll: { padding: 16 },

  heroBanner: { alignItems: 'center', marginBottom: 16 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#9C27B015', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  heroSub: { fontSize: 12, color: '#888' },

  engagementCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#9C27B010', borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#9C27B0' },
  engagementText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },

  sectionCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#9C27B012', alignItems: 'center', justifyContent: 'center' },
  sectionTitre: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  sectionContenu: { fontSize: 13, color: '#555', lineHeight: 21, paddingHorizontal: 16, paddingBottom: 16 },

  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  contactInfo: { flex: 1 },
  contactTitre: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  contactSub: { fontSize: 12, color: '#888', marginTop: 2, lineHeight: 18 },
});
