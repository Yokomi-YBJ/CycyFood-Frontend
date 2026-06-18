// app/profil/cgu.js
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SECTIONS = [
  {
    titre: '1. Objet et champ d\'application',
    contenu: `Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de l'application mobile LaTchop (ci-après « l'Application »), éditée et exploitée par LaTchop, service de restauration rapide basé à Ngaoundéré, Région de l'Adamaoua, Cameroun.

Toute utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser l'Application.

Les CGU peuvent être modifiées à tout moment. L'utilisateur sera informé de toute modification substantielle par notification in-app.`,
  },
  {
    titre: '2. Accès au service',
    contenu: `L'Application est accessible gratuitement à tout utilisateur disposant d'un accès à Internet et d'un appareil compatible. LaTchop ne saurait être tenu responsable des frais de connexion à Internet.

Pour accéder à l'ensemble des fonctionnalités, l'utilisateur doit créer un compte en fournissant des informations exactes, complètes et à jour. L'utilisateur s'engage à maintenir la confidentialité de ses identifiants de connexion.

L'Application est réservée aux personnes physiques capables de contracter. Les personnes mineures doivent obtenir l'autorisation de leurs représentants légaux.`,
  },
  {
    titre: '3. Création de compte et obligations',
    contenu: `Lors de la création de votre compte, vous vous engagez à :

• Fournir des informations véridiques, exactes et complètes ;
• Maintenir ces informations à jour ;
• Ne pas usurper l'identité d'une autre personne ;
• Garder votre mot de passe confidentiel et sécurisé ;
• Nous notifier immédiatement en cas d'utilisation non autorisée de votre compte.

LaTchop se réserve le droit de suspendre ou supprimer tout compte en cas de violation de ces obligations ou des présentes CGU.`,
  },
  {
    titre: '4. Commandes et paiements',
    contenu: `Toute commande passée via l'Application constitue une offre d'achat irrévocable pour les produits sélectionnés. La commande est réputée acceptée dès confirmation par l'Application.

Les prix affichés sont exprimés en Francs CFA (XAF) et sont susceptibles d'être modifiés sans préavis. Le prix applicable est celui affiché au moment de la validation de la commande.

En cas d'indisponibilité d'un produit après validation de la commande, LaTchop s'engage à en informer l'utilisateur dans les meilleurs délais.

Les frais de livraison, lorsqu'applicable, sont clairement indiqués avant la validation finale de la commande.`,
  },
  {
    titre: '5. Livraison',
    contenu: `Les délais de livraison sont indiqués à titre indicatif et peuvent varier en fonction des conditions climatiques, de la disponibilité des livreurs et de la distance.

La livraison est effectuée à l'adresse indiquée lors de la commande. En cas d'absence à l'adresse de livraison, LaTchop décline toute responsabilité pour les retards qui en découleraient.

LaTchop limite ses services de livraison aux quartiers desservis de Ngaoundéré (arrondissements 1, 2 et 3).`,
  },
  {
    titre: '6. Droit de rétractation et réclamations',
    contenu: `Compte tenu de la nature périssable des produits alimentaires proposés, le droit de rétractation ne s'applique pas aux commandes validées conformément aux règles applicables au commerce de denrées alimentaires.

Toute réclamation relative à une commande doit être formulée dans un délai de 30 minutes suivant la réception, via la fonction de contact WhatsApp disponible dans l'Application.

LaTchop s'engage à traiter toute réclamation dans un délai raisonnable et à proposer une solution adaptée (remplacement, avoir ou remboursement selon les cas).`,
  },
  {
    titre: '7. Propriété intellectuelle',
    contenu: `L'ensemble des éléments de l'Application (logos, textes, graphiques, images, interface, code source) est protégé par les droits de propriété intellectuelle et appartient exclusivement à LaTchop ou fait l'objet d'une licence d'utilisation accordée à LaTchop.

Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments de l'Application, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans autorisation écrite préalable de LaTchop.`,
  },
  {
    titre: '8. Responsabilité',
    contenu: `LaTchop s'efforce d'assurer la disponibilité et le bon fonctionnement de l'Application, mais ne peut garantir une disponibilité ininterrompue. Des interruptions temporaires peuvent survenir pour des raisons de maintenance ou d'incidents techniques.

LaTchop ne saurait être tenu responsable des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser l'Application, sous réserve des dispositions légales impératives applicables.

La responsabilité de LaTchop est limitée au montant de la commande concernée en cas de préjudice direct avéré.`,
  },
  {
    titre: '9. Protection des données personnelles',
    contenu: `Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, accessible depuis cette Application. Nous vous invitons à en prendre connaissance.

Conformément aux principes du RGPD et des lois applicables, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition concernant vos données personnelles.

Pour exercer ces droits, contactez-nous via WhatsApp au +237 691 09 40 48.`,
  },
  {
    titre: '10. Droit applicable et litiges',
    contenu: `Les présentes CGU sont régies par le droit camerounais et, pour les aspects non couverts, par les principes généraux du droit reconnus internationalement.

En cas de litige relatif à l'interprétation ou à l'exécution des présentes CGU, les parties s'engagent à rechercher une solution amiable avant tout recours contentieux.

À défaut d'accord amiable, le litige sera soumis aux juridictions compétentes de Ngaoundéré, Cameroun.`,
  },
  {
    titre: '11. Contact',
    contenu: `Pour toute question relative aux présentes CGU, vous pouvez nous contacter :

• Via WhatsApp : +237 691 09 40 48
• Application : onglet Profil > Nous contacter

Date de dernière mise à jour : Mars 2026
Version : 1.0`,
  },
];

export default function CGUScreen() {
  const router = useRouter();
  const [ouverts, setOuverts] = useState({});

  const toggle = (i) => setOuverts(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.containt}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroBanner}>
          <Ionicons name="document-text" size={32} color="#2196F3" />
          <Text style={styles.heroTitle}>CGU — LaTchop</Text>
          <Text style={styles.heroSub}>En vigueur depuis mars 2026 · Version 1.0</Text>
        </View>

        <Text style={styles.intro}>
          Veuillez lire attentivement les conditions ci-dessous avant d'utiliser l'application. Elles constituent un contrat juridiquement contraignant entre vous et LaTchop.
        </Text>

        {SECTIONS.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={styles.sectionCard}
            onPress={() => toggle(i)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitre}>{s.titre}</Text>
              <Ionicons
                name={ouverts[i] ? 'chevron-up' : 'chevron-down'}
                size={18} color="#2196F3"
              />
            </View>
            {ouverts[i] && (
              <Text style={styles.sectionContenu}>{s.contenu}</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En utilisant LaTchop, vous confirmez avoir lu et accepté l'intégralité de ces conditions.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  scroll: { padding: 16 },

  heroBanner: { backgroundColor: '#2196F310', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginTop: 10, marginBottom: 4 },
  heroSub: { fontSize: 12, color: '#888' },

  intro: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: '#2196F3' },

  sectionCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  sectionTitre: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginRight: 8 },
  sectionContenu: { fontSize: 13, color: '#555', lineHeight: 21, paddingHorizontal: 16, paddingBottom: 16 },

  footer: { backgroundColor: '#2196F310', borderRadius: 14, padding: 16, marginTop: 8 },
  footerText: { fontSize: 13, color: '#2196F3', textAlign: 'center', fontWeight: '600', lineHeight: 20 },
});
