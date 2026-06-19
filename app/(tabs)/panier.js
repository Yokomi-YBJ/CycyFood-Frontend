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
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function PanierScreen() {
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, incrementQuantite, decrementQuantite, viderPanier, totalPrix, totalArticles } = useCart();
  const { token } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [livraison, setLivraison] = useState(false);

  const FRAIS_LIVRAISON = 1000;
  const totalFinal = livraison ? totalPrix + FRAIS_LIVRAISON : totalPrix;

  const passerCommande = async () => {
    if (cart.length === 0) {
      showAlert({ title: 'Panier vide', message: 'Ajoutez des plats depuis l\'accueil.', type: 'warning' });
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
              produits: cart.map(item => ({ id: item.id_produit, quantite: item.quantite })),
              prixTotal: totalFinal,
              avec_livraison: livraison,
            }),
          });
          const data = await res.json();
          if (data.status === 'success') {
            viderPanier();
            showAlert({
              title: '✅ Commande envoyée !',
              message: `Votre commande a bien été enregistrée.${livraison ? '\n🛵 Livraison incluse.' : '\nPassez récupérer votre commande sur place.'}`,
              type: 'success',
            });
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

  const renderItem = ({ item }) => (
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
            style={styles.qtyBtn}
            onPress={() => incrementQuantite(item.id_produit)}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
     <StatusBar style="light" backgroundColor={COLORS.primary} />
      <View style={[styles.content, { paddingTop: insets.top + 8 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Vos sélections</Text>
            <Text style={styles.headerTitle}>Mon Panier</Text>
          </View>
          {cart.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={viderPanier}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.clearText}>Vider</Text>
            </TouchableOpacity>
          )}
        </View>

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cart-outline" size={56} color={COLORS.text.disabled} />
            </View>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptyText}>
              Explorez nos spécialités et ajoutez vos plats préférés !
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
                style={[styles.orderBtn, loading && { opacity: 0.7 }]}
                onPress={passerCommande}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.orderBtnText}>Commander maintenant</Text>
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
  qtyText: {
    minWidth: 28, textAlign: 'center',
    fontSize: 15, fontWeight: '800', color: COLORS.text.primary,
  },
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
  orderBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
