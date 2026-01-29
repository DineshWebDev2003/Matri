import React, { useEffect, useState } from 'react';
import '../utils/silenceAlerts';
import '../utils/globalErrorHandler';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { PremiumModalProvider } from '../context/PremiumModalContext';
import ErrorBoundary from '../components/ErrorBoundary';
import OfflineBanner from '../components/OfflineBanner';
import { ConnectivityProvider } from '../context/ConnectivityContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { registerForPushToken } from '../utils/pushNotifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// play app notification sound
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

function RootLayoutNav() {
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/notification.wav'),
          { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && st.didJustFinish) sound.unloadAsync();
        });
      } catch {}
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    registerForPushToken();
  }, []);

  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { theme } = useTheme();
  
  // Check if current route is login or register page
  const isAuthPage = segments[0] === '(auth)';

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF' }}>
      {/* Dynamic StatusBar: Dark icons in light mode, Light icons in dark mode */}
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />
      <OfflineBanner />
      <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { marginTop: 0 },
        animation: 'default' 
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="shortlisted" />
        <Stack.Screen name="viewed-profile" />
        <Stack.Screen name="interest-sent" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="interest-received" />
        <Stack.Screen name="profile-setting" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
});


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
      <ErrorBoundary>
        <ConnectivityProvider>
          <CustomThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <PremiumModalProvider>
                    <RootLayoutNav />
                  </PremiumModalProvider>
                </ThemeProvider>
              </AuthProvider>
            </LanguageProvider>
          </CustomThemeProvider>
        </ConnectivityProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
