// utils/produitsCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../constants/api';

const CLE_CACHE_PRODUITS = 'cache:produits:data';
const CLE_CACHE_VERSION  = 'cache:produits:version';

/**
 * Récupère la liste des produits en utilisant le cache local en priorité.
 *
 * Logique :
 * 1. On lit ce qui est stocké localement (AsyncStorage) — c'est instantané,
 *    aucun appel réseau, et c'est ce qui s'affiche en premier à l'écran.
 * 2. En parallèle (ou juste après), on interroge le serveur avec l'en-tête
 *    "If-None-Match: <version locale>".
 *    - Si le serveur répond 304 → rien n'a changé en base depuis la dernière
 *      fois : on ne retélécharge rien, le cache local reste valide tel quel.
 *    - Si le serveur répond 200 avec de nouvelles données → on écrase le
 *      cache local avec la nouvelle version et sa nouvelle empreinte.
 *
 * Résultat : l'app ne refait JAMAIS la même requête "pour rien" — elle vérifie
 * juste si ça a changé (requête légère, sans payload si rien n'a bougé), et ne
 * télécharge la liste complète que lorsque l'admin a réellement modifié un produit.
 */
export async function getProduitsAvecCache() {
  let produitsLocaux = null;
  let versionLocale = null;

  try {
    const [dataStr, version] = await Promise.all([
      AsyncStorage.getItem(CLE_CACHE_PRODUITS),
      AsyncStorage.getItem(CLE_CACHE_VERSION),
    ]);
    if (dataStr) produitsLocaux = JSON.parse(dataStr);
    versionLocale = version;
  } catch {
    // Cache local corrompu ou indisponible : on ignore, on retombera sur le réseau.
  }

  try {
    const headers = {};
    if (versionLocale) headers['If-None-Match'] = versionLocale;

    const res = await fetch(ENDPOINTS.produits, { headers });

    if (res.status === 304) {
      // Rien n'a changé côté serveur : le cache local est toujours valide.
      return { produits: produitsLocaux || [], depuisCache: true, misAJour: false };
    }

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        // Nouvelle version disponible : on met à jour le cache local.
        AsyncStorage.setItem(CLE_CACHE_PRODUITS, JSON.stringify(data.produits)).catch(() => {});
        if (data.version) {
          AsyncStorage.setItem(CLE_CACHE_VERSION, data.version).catch(() => {});
        }
        return { produits: data.produits, depuisCache: false, misAJour: true };
      }
    }

    // Réponse serveur inattendue : on retombe sur le cache local si dispo.
    if (produitsLocaux) {
      return { produits: produitsLocaux, depuisCache: true, misAJour: false, erreur: true };
    }
    throw new Error('Réponse serveur invalide et aucun cache local disponible.');
  } catch (err) {
    // Pas de réseau : on sert le cache local s'il existe, sinon on relance l'erreur.
    if (produitsLocaux) {
      return { produits: produitsLocaux, depuisCache: true, misAJour: false, erreur: true };
    }
    throw err;
  }
}

/**
 * Vide le cache local (utile en debug ou en cas de déconnexion complète).
 */
export async function viderCacheProduits() {
  try {
    await AsyncStorage.multiRemove([CLE_CACHE_PRODUITS, CLE_CACHE_VERSION]);
  } catch {
    // silencieux
  }
}
