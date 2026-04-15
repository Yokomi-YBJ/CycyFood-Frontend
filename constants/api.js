// constants/api.js
// ⚠️ Remplace par l'URL de ton backend Railway en production
export const API_BASE_URL = 'http://192.168.0.117:3000/api';

export const ENDPOINTS = {
  // Auth
  connexion:           `${API_BASE_URL}/auth/connexion`,
  inscription:         `${API_BASE_URL}/auth/inscription`,
  // Client
  produits:            `${API_BASE_URL}/produits`,
  commandes:           `${API_BASE_URL}/commandes`,
  mesCommandes:        `${API_BASE_URL}/commandes/mes-commandes`,
  profil:              `${API_BASE_URL}/profil`,
  changerMotDePasse:   `${API_BASE_URL}/profil/mot-de-passe`,
  pushToken:           `${API_BASE_URL}/profil/push-token`,
  // Admin
  adminStats:          `${API_BASE_URL}/admin/stats`,
  adminProduits:       `${API_BASE_URL}/admin/produits`,
  adminCommandes:      `${API_BASE_URL}/admin/commandes`,
  adminClients:        `${API_BASE_URL}/admin/clients`,
};
