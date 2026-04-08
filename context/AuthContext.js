// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { ENDPOINTS } from '../constants/api';

const AuthContext = createContext(null);

// ← Plus d'import Constants — projectId hardcodé directement
const EXPO_PROJECT_ID = 'c46f6b6d-56ce-410d-ade8-84c2413db122';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ===================== ENREGISTRER LE PUSH TOKEN =====================
const enregistrerPushToken = async (userJwtToken) => {
  try {
    console.log('[NOTIF] Démarrage enregistrement push token...');
    console.log('[NOTIF] JWT présent ?', !!userJwtToken);
    console.log('[NOTIF] ProjectId:', EXPO_PROJECT_ID);

    // Vérifier permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('[NOTIF] Permission actuelle:', existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[NOTIF] Permission après demande:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log('[NOTIF] BLOQUÉ — permission refusée');
      return null;
    }

    // Obtenir le token
    console.log('[NOTIF] Appel getExpoPushTokenAsync...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });

    const pushToken = tokenData.data;
    console.log('[NOTIF] Token obtenu :', pushToken);

    if (!pushToken) {
      console.log('[NOTIF] ERREUR — token vide ou null');
      return null;
    }

    // Envoyer au backend
    console.log('[NOTIF] Envoi token au backend...');
    const response = await fetch(ENDPOINTS.pushToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userJwtToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });

    const result = await response.json();
    console.log('[NOTIF] Réponse backend:', JSON.stringify(result));

    if (result.status === 'success') {
      console.log('[NOTIF] ✅ Token enregistré avec succès en base !');
    } else {
      console.log('[NOTIF] ❌ Échec enregistrement:', result.message);
    }

    return pushToken;
  } catch (err) {
    console.log('[NOTIF] ❌ ERREUR:', err.message);
    console.log('[NOTIF] Stack:', err.stack);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la session sauvegardée au démarrage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const savedUser = await SecureStore.getItemAsync('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Délai court pour laisser l'app s'initialiser complètement
          setTimeout(() => {
            enregistrerPushToken(savedToken);
          }, 2000);
        }
      } catch (e) {
        console.log('[AUTH] Erreur chargement session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Écouter les notifications reçues en foreground
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('[NOTIF] Reçue (foreground):', notification.request.content.title);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[NOTIF] Touchée par l\'utilisateur:', data);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  const connexion = async (telephone, password) => {
    const res = await fetch(ENDPOINTS.connexion, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telephone, password }),
    });
    const data = await res.json();
    if (data.status === 'success') {
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      // Délai pour laisser la navigation se stabiliser avant d'enregistrer
      setTimeout(() => {
        enregistrerPushToken(data.token);
      }, 1500);
    }
    return data;
  };

  const inscription = async (form) => {
    const res = await fetch(ENDPOINTS.inscription, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.status === 'success') {
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setTimeout(() => {
        enregistrerPushToken(data.token);
      }, 1500);
    }
    return data;
  };

  const updateUser = async (nouvellesInfos) => {
    const userMisAJour = { ...user, ...nouvellesInfos };
    setUser(userMisAJour);
    await SecureStore.setItemAsync('user', JSON.stringify(userMisAJour));
  };

  const deconnexion = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      connexion, inscription, updateUser, deconnexion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);