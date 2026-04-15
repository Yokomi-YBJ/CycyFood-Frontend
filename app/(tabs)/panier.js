// app/(tabs)/panier.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ENDPOINTS } from '../../constants/api';

export default function PanierScreen() {
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, incrementQuantite, decrementQuantite, viderPanier, totalPrix, totalArticles } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [livraison, setLivraison] = useState(false);

  const FRAIS_LIVRAISON = 1000;
  const totalFinal = livraison ? totalPrix + FRAIS_LIVRAISON : totalPrix;

  const passerCommande = async () => {
    if (cart.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de commander.');
      return;
    }

    Alert.alert(
      'Confirmer la commande',
      `Total : ${totalFinal} Fcfa${livraison ? ' (livraison incluse)' : ''}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await fetch(ENDPOINTS.commandes, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  produits: cart.map(item => ({ id: item.id_produit, quantite: item.quantite })),
                  prixTotal: totalFinal,
                }),
              });
              const data = await res.json();
              if (data.status === 'success') {
                viderPanier();
                Alert.alert('✅ Commande envoyée !', `Votre commande  a bien été enregistrée.`);
              } else {
                Alert.alert('Erreur', data.message);
              }
            } catch (e) {
              Alert.alert('Problème de connexion', 'Impossible d\'envoyer votre commande. Vérifiez votre connexion internet.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.img_url }}
        style={styles.itemImg}
        defaultSource={require('../../assets/placeholder.png')}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNom}>{item.nom_produit}</Text>
        <Text style={styles.itemPriceUnit}>{item.Prix} Fcfa / unité</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantite(item.id_produit)}>
            <Ionicons name="remove" size={16} color="#FF6B35" />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantite}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQuantite(item.id_produit)}>
            <Ionicons name="add" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>{item.Prix * item.quantite} Fcfa</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id_produit)}>
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.containt}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={viderPanier} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color="#ff4444" />
            <Text style={styles.clearText}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptyText}>Ajoutez des plats depuis l'accueil pour commencer !</Text>
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
          <View style={styles.recap}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Sous-total ({totalArticles} article{totalArticles > 1 ? 's' : ''})</Text>
              <Text style={styles.recapVal}>{totalPrix} Fcfa</Text>
            </View>

            {/* Option livraison */}
            <TouchableOpacity style={styles.livraisonRow} onPress={() => setLivraison(!livraison)}>
              <View style={[styles.checkbox, livraison && styles.checkboxActive]}>
                {livraison && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.livraisonText}>Inclure la livraison (+{FRAIS_LIVRAISON} Fcfa)</Text>
            </TouchableOpacity>

            <View style={[styles.recapRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>{totalFinal} Fcfa</Text>
            </View>

            <TouchableOpacity style={styles.btnCommander} onPress={passerCommande} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.btnCommanderText}>Commander maintenant</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6B35' },
  containt: {flex: 1, backgroundColor: 'white'},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  clearText: { color: '#ff4444', fontSize: 13, fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },

  list: { paddingHorizontal: 16, paddingBottom: 8 },
  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 12, overflow: 'hidden', padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  itemImg: { width: 75, height: 75, borderRadius: 12 },
  itemInfo: { flex: 1, paddingHorizontal: 12, justifyContent: 'space-between' },
  itemNom: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  itemPriceUnit: { fontSize: 12, color: '#888' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#FF6B3518',
    alignItems: 'center', justifyContent: 'center',
  },
  qty: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', minWidth: 20, textAlign: 'center' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal: { fontSize: 14, fontWeight: '800', color: '#FF6B35' },
  deleteBtn: { padding: 4 },

  recap: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  recapLabel: { fontSize: 14, color: '#888' },
  recapVal: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  livraisonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#ddd', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  livraisonText: { fontSize: 14, color: '#555' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginBottom: 16 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#FF6B35' },
  btnCommander: {
    backgroundColor: '#FF6B35', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnCommanderText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
