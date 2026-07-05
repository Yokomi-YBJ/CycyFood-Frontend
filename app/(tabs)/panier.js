// app/(tabs)/panier.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useCommandeLimit } from '../../context/CommandeLimitContext';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const MAX_QUANTITE_PAR_PRODUIT = 4;

export default function PanierScreen() {
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, incrementQuantite, decrementQuantite, viderPanier, totalPrix, totalArticles } = useCart();
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const { peutCommander, nbEnAttente, incrementer, MAX_COMMANDES_EN_ATTENTE } = useCommandeLimit();
  const [loading, setLoading] = useState(false);
  const [livraison, setLivraison] = useState(false);

  const FRAIS_LIVRAISON = 1000;
  const totalFinal = livraison ? totalPrix + FRAIS_LIVRAISON : totalPrix;

  const passerCommande = async () => {
    if (cart.length === 0) {
      showAlert({ title: 'Panier vide', message: 'Ajoutez des plats depuis l\'accueil.', type: 'warning' });
      return;
    }

    // Vérification locale immédiate (confort UX) — le serveur revérifie systématiquement.
    if (!peutCommander) {
      showAlert({
        title: 'Limite atteinte',
        message: `Vous avez déjà ${MAX_COMMANDES_EN_ATTENTE} commandes en attente. Patientez qu'elles soient traitées avant d'en passer une nouvelle.`,
        type: 'warning',
      });
      return;
    }

    showAlert({
      title: 'Confirmer la commande',
      message: `Total : ${totalFinal} Fcfa${livraison ? '\nLivraison incluse (+' + FRAIS_LIVRAISON + ' Fcfa)' : '\nRetrait sur place'}`,
      type: 'info',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(ENDPOINTS.commandes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              produits: cart.map(item => ({
                id: item.id_produit,
                quantite: Math.min(item.quantite, MAX_QUANTITE_PAR_PRODUIT),
              })),
              avec_livraison: livraison,
            }),
          });
          const data = await res.json();

          if (data.status === 'success') {
            viderPanier();
            incrementer();

            // Le serveur peut avoir ajusté certaines quantités par manque de stock.
            const messageAjustements = data.ajustements?.length > 0
              ? '\n\n' + data.ajustements.join('\n')
              : '';

            showAlert({
              title: 'Commande envoyée',
              message: `Votre commande a bien été enregistrée.${livraison ? '\nLivraison incluse.' : '\nPassez récupérer votre commande sur place.'}${messageAjustements}`,
              type: data.ajustements?.length > 0 ? 'warning' : 'success',
            });
          } else if (res.status === 429) {
            // Limite anti-spam refusée côté serveur (cas de désynchronisation avec le compteur local)
            showAlert({ title: 'Limite atteinte', message: data.message, type: 'warning' });
          } else {
            showAlert({ title: 'Erreur', message: data.message, type: 'error' });
          }
        } catch {
          showAlert({ title: 'Connexion impossible', message: 'Vérifiez votre connexion internet.', type: 'error' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const renderItem = ({ item }) => {
    const stockLimit = item.stock !== undefined && item.stock !== null ? item.stock : MAX_QUANTITE_PAR_PRODUIT;
    const estLimiteStock = item.stock !== undefined && item.stock !== null && item.stock < MAX_QUANTITE_PAR_PRODUIT && item.quantite >= item.stock;
    const atteintMax = item.quantite >= MAX_QUANTITE_PAR_PRODUIT || estLimiteStock;
    return (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: item.img_url }}
          style={styles.itemImg}
          defaultSource={require('../../assets/placeholder.png')}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemNom} numberOfLines={1}>{item.nom_produit}</Text>
          <Text style={styles.itemPrixUnit}>{item.Prix} Fcfa / unité</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => decrementQuantite(item.id_produit)}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantite}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, atteintMax && styles.qtyBtnDisabled]}
              onPress={() => !atteintMax && incrementQuantite(item.id_produit)}
              disabled={atteintMax}
            >
              <Ionicons name="add" size={16} color={atteintMax ? COLORS.text.disabled : COLORS.primary} />
            </TouchableOpacity>
          </View>
          {atteintMax && (
            <Text style={styles.maxHint}>
              {estLimiteStock ? `Seulement ${item.stock} unité(s) disponible(s)` : `Maximum ${MAX_QUANTITE_PAR_PRODUIT} par plat`}
            </Text>
          )}
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>{item.Prix * item.quantite} Fcfa</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.id_produit)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
     <StatusBar style="light" backgroundColor={COLORS.primary} />
      <View style={[styles.content, { paddingTop: insets.top - 28  }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Vos sélections</Text>
            <Text style={styles.headerTitle}>Mon panier</Text>
          </View>
          {cart.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={viderPanier}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.clearText}>Vider</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bandeau limite anti-spam */}
        {nbEnAttente > 0 && (
          <View style={[styles.limiteBanner, !peutCommander && styles.limiteBannerAlerte]}>
            <Ionicons
              name={peutCommander ? 'information-circle-outline' : 'alert-circle-outline'}
              size={16}
              color={peutCommander ? COLORS.info : COLORS.warning}
            />
            <Text style={[styles.limiteText, !peutCommander && { color: COLORS.warning }]}>
              {nbEnAttente}/{MAX_COMMANDES_EN_ATTENTE} commande(s) en attente de traitement
            </Text>
          </View>
        )}

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cart-outline" size={56} color={COLORS.text.disabled} />
            </View>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptyText}>
              Explorez nos plats et ajoutez vos préférés.
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={item => item.id_produit.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            {/* Récapitulatif */}
            <View style={styles.recapContainer}>
              {/* Sous-total */}
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>
                  Sous-total ({totalArticles} article{totalArticles > 1 ? 's' : ''})
                </Text>
                <Text style={styles.recapVal}>{totalPrix} Fcfa</Text>
              </View>

              {/* Option livraison */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.livraisonToggle, livraison && styles.livraisonToggleActive]}
                onPress={() => setLivraison(!livraison)}
              >
                <View style={styles.livraisonLeft}>
                  <View style={[styles.checkbox, livraison && styles.checkboxChecked]}>
                    {livraison && <Ionicons name="checkmark" size={13} color={COLORS.primary} />}
                  </View>
                  <View>
                    <Text style={[styles.livraisonTitle, livraison && styles.livraisonTitleActive]}>
                      Livraison à domicile
                    </Text>
                    <Text style={[styles.livraisonSub, livraison && styles.livraisonSubActive]}>
                      +{FRAIS_LIVRAISON} Fcfa · Ngaoundéré
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="bicycle-outline"
                  size={22}
                  color={livraison ? COLORS.primary : COLORS.text.secondary}
                />
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <Text style={styles.totalVal}>{totalFinal} <Text style={styles.fcfa}>Fcfa</Text></Text>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[styles.orderBtn, (loading || !peutCommander) && { opacity: 0.6 }]}
                onPress={passerCommande}
                disabled={loading || !peutCommander}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={peutCommander ? 'checkmark-circle-outline' : 'lock-closed-outline'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.orderBtnText}>
                      {peutCommander ? 'Commander maintenant' : 'Limite de commandes atteinte'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  content: { flex: 1 , backgroundColor: COLORS.background},

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
  },
  headerEyebrow: {
    fontSize: 11, fontWeight: '800', color: COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text.primary, letterSpacing: -0.5 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.error + '12',
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  clearText: { fontSize: 13, color: COLORS.error, fontWeight: '700' },

  limiteBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: COLORS.info + '12', borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  limiteBannerAlerte: { backgroundColor: COLORS.warning + '15' },
  limiteText: { fontSize: 12, color: COLORS.info, fontWeight: '600', flex: 1 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIconWrap: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.sm },
  emptyText: {
    fontSize: 15, color: COLORS.text.secondary,
    textAlign: 'center', lineHeight: 22,
  },

  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  itemCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, marginBottom: SPACING.sm,
    padding: SPACING.md, alignItems: 'center',
    ...SHADOWS.light,
  },
  itemImg: { width: 76, height: 76, borderRadius: RADIUS.md },
  itemInfo: { flex: 1, marginLeft: SPACING.md },
  itemNom: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 2 },
  itemPrixUnit: { fontSize: 12, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-start',
  },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyText: {
    minWidth: 28, textAlign: 'center',
    fontSize: 15, fontWeight: '800', color: COLORS.text.primary,
  },
  maxHint: { fontSize: 10, color: COLORS.warning, marginTop: 4, fontWeight: '600' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 76 },
  itemTotal: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  deleteBtn: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.error + '12',
    alignItems: 'center', justifyContent: 'center',
  },

  recapContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
  recapRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  recapLabel: { fontSize: 14, color: COLORS.text.secondary },
  recapVal: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },

  livraisonToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  livraisonToggleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  livraisonLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxChecked: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  livraisonTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  livraisonTitleActive: { color: COLORS.primary },
  livraisonSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 1 },
  livraisonSubActive: { color: COLORS.primary + 'AA' },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: SPACING.lg,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  totalVal: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  fcfa: { fontSize: 14, fontWeight: '600' },

  orderBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  orderBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
