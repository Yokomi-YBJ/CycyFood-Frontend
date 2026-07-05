// constants/api.js
// ⚠️ Remplace par l'URL de ton backend Railway en production
export const API_BASE_URL = 'https://cycyfood-backend.onrender.com/api';

export const ENDPOINTS = {
  // Auth
  connexion:           `${API_BASE_URL}/auth/connexion`,
  inscription:         `${API_BASE_URL}/auth/inscription`,
  // Client
  produits:            `${API_BASE_URL}/produits`,
  commandes:            `${API_BASE_URL}/commandes`,
  mesCommandes:         `${API_BASE_URL}/commandes/mes-commandes`,
  nbEnAttente:          `${API_BASE_URL}/commandes/nb-en-attente`,
  profil:              `${API_BASE_URL}/profil`,
  changerMotDePasse:   `${API_BASE_URL}/profil/mot-de-passe`,
  pushToken:           `${API_BASE_URL}/profil/push-token`,
  settings:            `${API_BASE_URL}/settings`,
  // Admin
  adminStats:          `${API_BASE_URL}/admin/stats`,
  adminProduits:       `${API_BASE_URL}/admin/produits`,
  adminCommandes:      `${API_BASE_URL}/admin/commandes`,
  adminCommandesStatutGroupe: `${API_BASE_URL}/admin/commandes/statut-groupe`,
  adminClients:        `${API_BASE_URL}/admin/clients`,
};
