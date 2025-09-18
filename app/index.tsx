import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function StartPage() {
  const auth = useAuth();

  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show login page if not authenticated, otherwise go to tabs
  return <Redirect href={auth.isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
