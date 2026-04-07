// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ENDPOINTS } from '../constants/api';

const AuthContext = createContext(null);

// Configuration globale des notifications (à appeler une seule fois)
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
    console.log('=== PUSH TOKEN DEBUG ===');
    console.log('JWT reçu ?', !!userJwtToken);

    const { status } = await Notifications.getPermissionsAsync();
    console.log('Permission actuelle:', status);

    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }
    console.log('Permission finale:', finalStatus);

    if (finalStatus !== 'granted') {
      console.log('STOP — permission refusée');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log('Token obtenu:', tokenData?.data);

    const response = await fetch(ENDPOINTS.pushToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userJwtToken}`,
      },
      body: JSON.stringify({ push_token: tokenData.data }),
    });

    const result = await response.json();
    console.log('Réponse backend:', JSON.stringify(result));

  } catch (err) {
    console.log('ERREUR push token:', err.message);
  }
};


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la session au démarrage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const savedUser = await SecureStore.getItemAsync('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Ré-enregistrer le push token à chaque démarrage
          // (le token peut changer après réinstallation)
          enregistrerPushToken(savedToken);
        }
      } catch (e) {
        console.log('Erreur chargement session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Écouter les notifications reçues pendant l'utilisation de l'app
  useEffect(() => {
    // Notification reçue en foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue (foreground):', notification.request.content.title);
    });

    // Notification touchée (tap) → on pourrait naviguer vers les commandes
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification touchée, données:', data);
      // Navigation vers commandes possible ici avec router.push('/(tabs)/commandes')
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
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
      // Enregistrer le push token après connexion
      enregistrerPushToken(data.token);
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
      // Enregistrer le push token après inscription
      enregistrerPushToken(data.token);
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
