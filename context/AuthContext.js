// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ENDPOINTS } from '../constants/api';

const AuthContext = createContext(null);

const EXPO_PROJECT_ID = 'c46f6b6d-56ce-410d-ade8-84c2413db122';

// ── Configuration globale des notifications ───────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Créer le canal Android (obligatoire Android 8+) ───────
const creerCanalAndroid = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Cycy Food',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B35',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
  // Canal dédié aux commandes admin
  await Notifications.setNotificationChannelAsync('commandes', {
    name: 'Nouvelles commandes',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: '#FF6B35',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
};

// ── Enregistrer le push token ─────────────────────────────
const enregistrerPushToken = async (userJwtToken) => {
  try {
    console.log('[NOTIF] Démarrage enregistrement...');

    await creerCanalAndroid();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NOTIF] Permission refusée');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });

    const pushToken = tokenData.data;

    if (!pushToken) return null;

    const response = await fetch(ENDPOINTS.pushToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userJwtToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });

    const result = await response.json();
    console.log('[NOTIF] Réponse backend:', result.status);

    return pushToken;
  } catch (err) {
    console.log('[NOTIF] Erreur:', err.message);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Charger la session sauvegardée ───────────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Créer le canal Android dès le démarrage
        await creerCanalAndroid();

        const savedToken = await SecureStore.getItemAsync('token');
        const savedUser  = await SecureStore.getItemAsync('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setTimeout(() => enregistrerPushToken(savedToken), 2000);
        }
      } catch (e) {
        console.log('[AUTH] Erreur chargement session:', e.message);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // ── Écouter les notifications ─────────────────────────────
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(notif => {
      console.log('[NOTIF] Reçue:', notif.request.content.title);
    });
    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[NOTIF] Touchée:', data);
    });
    return () => { sub1.remove(); sub2.remove(); };
  }, []);

  // ── Connexion ─────────────────────────────────────────────
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
      setTimeout(() => enregistrerPushToken(data.token), 1500);
    }
    return data;
  };

  // ── Inscription ───────────────────────────────────────────
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
      setTimeout(() => enregistrerPushToken(data.token), 1500);
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
