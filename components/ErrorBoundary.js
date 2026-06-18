// components/ErrorBoundary.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <View style={s.iconWrap}>
            <Ionicons name="warning-outline" size={52} color={COLORS.error} />
          </View>
          <Text style={s.title}>Une erreur est survenue</Text>
          <Text style={s.subtitle}>
            L'application a rencontré un problème inattendu. Veuillez réessayer.
          </Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={s.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.error + '12',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22, fontWeight: '800', color: COLORS.text.primary,
    marginBottom: SPACING.sm, textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: COLORS.text.secondary,
    textAlign: 'center', lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
