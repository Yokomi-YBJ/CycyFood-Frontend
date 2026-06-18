// context/AlertContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const AlertContext = createContext();

const TYPE_CFG = {
  success: { icon: 'checkmark-circle', color: COLORS.success },
  error:   { icon: 'close-circle',     color: COLORS.error },
  warning: { icon: 'warning',           color: COLORS.warning },
  info:    { icon: 'information-circle',color: COLORS.info },
};

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState({
    visible: false, title: '', message: '', type: 'info',
    confirmText: 'OK', onConfirm: null, cancelText: null, onCancel: null,
  });

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const showAlert = useCallback((cfg) => {
    setConfig({
      visible: true,
      title:       cfg.title || 'Information',
      message:     cfg.message || '',
      type:        cfg.type || 'info',
      confirmText: cfg.confirmText || 'OK',
      onConfirm:   cfg.onConfirm || null,
      cancelText:  cfg.cancelText || null,
      onCancel:    cfg.onCancel || null,
    });
    // Reset avant animation
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.88);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setConfig(prev => ({ ...prev, visible: false }));
    });
  }, [fadeAnim, scaleAnim]);

  const handleConfirm = () => {
    const cb = config.onConfirm;
    hideAlert();
    if (cb) setTimeout(cb, 200); // Petit délai pour que l'animation se termine
  };

  const handleCancel = () => {
    const cb = config.onCancel;
    hideAlert();
    if (cb) setTimeout(cb, 200);
  };

  const cfg = TYPE_CFG[config.type] || TYPE_CFG.info;

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        transparent
        visible={config.visible}
        animationType="none"
        onRequestClose={hideAlert}
        statusBarTranslucent
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[
            styles.card,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            {/* Icône */}
            <View style={[styles.iconCircle, { backgroundColor: cfg.color + '18' }]}>
              <Ionicons name={cfg.icon} size={40} color={cfg.color} />
            </View>

            <Text style={styles.title}>{config.title}</Text>
            {config.message ? (
              <Text style={styles.message}>{config.message}</Text>
            ) : null}

            {/* Boutons */}
            <View style={styles.btnRow}>
              {config.cancelText && (
                <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
                  <Text style={styles.btnCancelText}>{config.cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: cfg.color }, config.cancelText && { flex: 1.5 }]}
                onPress={handleConfirm}
              >
                <Text style={styles.btnConfirmText}>{config.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl + 4,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.heavy,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20, fontWeight: '800', color: COLORS.text.primary,
    textAlign: 'center', marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15, color: COLORS.text.secondary,
    textAlign: 'center', lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  btnRow: {
    flexDirection: 'row', gap: SPACING.md, width: '100%',
  },
  btnCancel: {
    flex: 1, height: 50, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  btnCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.text.secondary },
  btnConfirm: {
    flex: 1, height: 50, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  btnConfirmText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
