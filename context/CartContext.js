// context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (produit) => {
    setCart(prev => {
      const existing = prev.find(item => item.id_produit === produit.id_produit);
      if (existing) {
        return prev.map(item =>
          item.id_produit === produit.id_produit
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      return [...prev, { ...produit, quantite: 1 }];
    });
  };

  const removeFromCart = (id_produit) => {
    setCart(prev => prev.filter(item => item.id_produit !== id_produit));
  };

  const incrementQuantite = (id_produit) => {
    setCart(prev =>
      prev.map(item =>
        item.id_produit === id_produit
          ? { ...item, quantite: item.quantite + 1 }
          : item
      )
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
