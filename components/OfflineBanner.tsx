import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../context/ConnectivityContext';

export default function OfflineBanner() {
  const { isOffline } = useConnectivity();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { top: Platform.OS === 'android' ? insets.top : 0 }]}>
      <Text style={styles.text}>You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
