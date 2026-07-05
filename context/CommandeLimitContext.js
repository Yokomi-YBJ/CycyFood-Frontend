// context/CommandeLimitContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ENDPOINTS } from '../constants/api';

const CommandeLimitContext = createContext(null);

export const MAX_COMMANDES_EN_ATTENTE = 3;

// Ce contexte ne fait que du confort UX (bloquer immédiatement le bouton
// "Commander" sans attendre l'aller-retour réseau). La vraie règle est
// toujours revérifiée côté serveur — voir commandeController.js.
export function CommandeLimitProvider({ children }) {
  const [nbEnAttente, setNbEnAttente] = useState(0);

  const peutCommander = nbEnAttente < MAX_COMMANDES_EN_ATTENTE;

  // Appelé après une commande réussie
  const incrementer = useCallback(() => {
    setNbEnAttente(prev => Math.min(prev + 1, MAX_COMMANDES_EN_ATTENTE));
  }, []);

  // Appelé quand une commande passe de "en_attente" à autre chose côté client
  const decrementer = useCallback(() => {
    setNbEnAttente(prev => Math.max(prev - 1, 0));
  }, []);

  // Resynchronise avec le serveur (à appeler au focus de l'écran commandes / login)
  const resynchroniser = useCallback(async (token) => {
    if (!token) return;
    try {
      const res = await fetch(ENDPOINTS.nbEnAttente, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNbEnAttente(data.nb_en_attente);
      }
    } catch {
      // Silencieux : en cas d'échec réseau on garde la valeur locale existante
    }
  }, []);

  const reinitialiser = useCallback(() => setNbEnAttente(0), []);

  return (
    <CommandeLimitContext.Provider value={{
      nbEnAttente, peutCommander, incrementer, decrementer,
      resynchroniser, reinitialiser, MAX_COMMANDES_EN_ATTENTE,
    }}>
      {children}
    </CommandeLimitContext.Provider>
  );
}

export const useCommandeLimit = () => {
  const ctx = useContext(CommandeLimitContext);
  if (!ctx) throw new Error('useCommandeLimit must be used within CommandeLimitProvider');
  return ctx;
};
