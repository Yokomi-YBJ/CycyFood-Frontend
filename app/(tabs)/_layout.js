// app/(tabs)/_layout.js
import { Tabs, usePathname } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function TabIcon({ name, nameActive, color, size, focused }) {
  return (
    <Ionicons
      name={focused ? nameActive : name}
      size={size}
      color={color}
    />
  );
}

function CartIcon({ color, size, focused }) {
  const { totalArticles } = useCart();
  return (
    <View>
      <MaterialCommunityIcons
        name={focused ? 'shopping' : 'shopping-outline'}
        size={size}
        color={color}
      />
      {totalArticles > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalArticles > 99 ? '99+' : totalArticles}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Masquer la tabBar sur les pages secondaires du profil
  const hideTabBar =
    pathname.startsWith('/profil') && pathname !== '/profil' ||
    pathname.includes('/modifier') ||
    pathname.includes('/cgu') ||
    pathname.includes('/confidentialite');

  const BASE_HEIGHT = 62;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.07,
          shadowRadius: 16,
          elevation: 20,
          height: BASE_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          display: hideTabBar ? 'none' : 'flex',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home-outline" nameActive="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="panier"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size, focused }) => (
            <CartIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="commandes"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="receipt-outline" nameActive="receipt" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person-outline" nameActive="person" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 12,
  },
});
