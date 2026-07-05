// context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (produit) => {
    const existing = cart.find(item => item.id_produit === produit.id_produit);
    const currentQty = existing ? existing.quantite : 0;

    // Plafond strict de 4 unités
    if (currentQty >= 4) {
      return {
        success: false,
        message: 'Vous ne pouvez pas ajouter plus de 4 unités de ce plat.',
      };
    }

    // Validation du stock disponible
    if (produit.stock !== undefined && produit.stock !== null && currentQty >= produit.stock) {
      return {
        success: false,
        message: `Stock insuffisant. Seulement ${produit.stock} unités disponibles.`,
      };
    }

    setCart(prev => {
      const exists = prev.find(item => item.id_produit === produit.id_produit);
      if (exists) {
        return prev.map(item =>
          item.id_produit === produit.id_produit
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      return [...prev, { ...produit, quantite: 1 }];
    });

    return { success: true };
  };

  const removeFromCart = (id_produit) => {
    setCart(prev => prev.filter(item => item.id_produit !== id_produit));
  };

  const incrementQuantite = (id_produit) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id_produit === id_produit) {
          const currentQty = item.quantite;
          const maxAllowed = 4;
          const stockLimit = item.stock !== undefined && item.stock !== null ? item.stock : 4;
          const limit = Math.min(maxAllowed, stockLimit);
          if (currentQty >= limit) {
            return item;
          }
          return { ...item, quantite: currentQty + 1 };
        }
        return item;
      })
    );
  };

  const decrementQuantite = (id_produit) => {
    setCart(prev =>
      prev.map(item =>
        item.id_produit === id_produit && item.quantite > 1
          ? { ...item, quantite: item.quantite - 1 }
          : item
      ).filter(item => item.quantite > 0)
    );
  };

  const viderPanier = () => setCart([]);

  const totalPrix = cart.reduce((sum, item) => sum + item.Prix * item.quantite, 0);
  const totalArticles = cart.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart,
      incrementQuantite, decrementQuantite,
      viderPanier, totalPrix, totalArticles,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
