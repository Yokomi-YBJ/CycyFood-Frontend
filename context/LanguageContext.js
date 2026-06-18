// context/LanguageContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Traductions ──────────────────────────────────────────
const translations = {
  fr: {
    // Navigation
    home:       'Accueil',
    cart:       'Panier',
    orders:     'Commandes',
    profile:    'Profil',

    // Auth
    login:        'Connexion',
    logout:       'Déconnexion',
    register:     'Inscription',
    phone:        'Téléphone',
    password:     'Mot de passe',
    address:      'Adresse',
    name:         'Nom',
    firstname:    'Prénom',

    // Profil
    info:         'Mes informations',
    edit_info:    'Modifier le profil',
    language:     'Langue',
    support:      'Assistance',
    legal:        'Informations légales',
    about:        'À propos',
    cgu:          'Conditions d\'utilisation',
    privacy:      'Politique de confidentialité',
    contact_us:   'Nous contacter',
    version:      'Version de l\'application',
    developed_by: 'Développé par',

    // Commandes
    orders_title:  'Mes commandes',
    no_orders:     'Aucune commande',
    order_date:    'Date',
    order_total:   'Total',
    delivery:      'Livraison',
    pickup:        'Retrait sur place',

    // Panier
    cart_title:    'Mon panier',
    cart_empty:    'Votre panier est vide',
    order_now:     'Commander maintenant',
    subtotal:      'Sous-total',
    delivery_fee:  'Frais de livraison',
    total:         'Total',
    clear_cart:    'Vider le panier',

    // Produits
    add_to_cart:   'Commander',
    added:         'Ajouté !',

    // Messages généraux
    loading:       'Chargement…',
    error:         'Erreur',
    success:       'Succès',
    cancel:        'Annuler',
    confirm:       'Confirmer',
    save:          'Sauvegarder',
    back:          'Retour',
    next:          'Suivant',
  },

  en: {
    // Navigation
    home:       'Home',
    cart:       'Cart',
    orders:     'Orders',
    profile:    'Profile',

    // Auth
    login:        'Login',
    logout:       'Logout',
    register:     'Sign Up',
    phone:        'Phone',
    password:     'Password',
    address:      'Address',
    name:         'Last Name',
    firstname:    'First Name',

    // Profile
    info:         'My Information',
    edit_info:    'Edit Profile',
    language:     'Language',
    support:      'Support',
    legal:        'Legal',
    about:        'About',
    cgu:          'Terms of Use',
    privacy:      'Privacy Policy',
    contact_us:   'Contact Us',
    version:      'App Version',
    developed_by: 'Developed by',

    // Orders
    orders_title:  'My Orders',
    no_orders:     'No orders yet',
    order_date:    'Date',
    order_total:   'Total',
    delivery:      'Delivery',
    pickup:        'Pickup',

    // Cart
    cart_title:    'My Cart',
    cart_empty:    'Your cart is empty',
    order_now:     'Order Now',
    subtotal:      'Subtotal',
    delivery_fee:  'Delivery Fee',
    total:         'Total',
    clear_cart:    'Clear Cart',

    // Products
    add_to_cart:   'Add to Cart',
    added:         'Added!',

    // General
    loading:       'Loading…',
    error:         'Error',
    success:       'Success',
    cancel:        'Cancel',
    confirm:       'Confirm',
    save:          'Save',
    back:          'Back',
    next:          'Next',
  },
};

// ── Contexte ─────────────────────────────────────────────
const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('fr');

  const changeLocale = useCallback(async (newLocale) => {
    if (!translations[newLocale]) return;
    setLocale(newLocale);
    try {
      await AsyncStorage.setItem('app_locale', newLocale);
    } catch {
      // Silently fail if AsyncStorage is unavailable
    }
  }, []);

  // Fonction de traduction — retourne la clé si traduction manquante
  const t = useCallback((key) => {
    return translations[locale]?.[key] ?? translations['fr']?.[key] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, changeLocale, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ── Hooks ─────────────────────────────────────────────────
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

// Alias pratique (même hook, deux noms)
export const useTranslation = useLanguage;

export default LanguageContext;
