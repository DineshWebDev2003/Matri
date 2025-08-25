import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Still loading
    }

    const inAuthGroup = segments[0] === '(auth)';
    const isSplashScreen = segments.length === 0 || segments[0] === 'index';

    if (isSplashScreen) {
      // Let the splash screen handle its own navigation
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      // If not authenticated and not in auth group, redirect to login.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // If authenticated and in auth group, redirect to the main app.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="shortlisted" options={{ headerShown: false }} />
      <Stack.Screen name="viewed-profile" options={{ headerShown: false }} />
      <Stack.Screen name="interest-sent" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="interest-received" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
        <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
