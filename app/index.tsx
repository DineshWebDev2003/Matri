import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function StartPage() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const auth = useAuth();

  // Check onboarding flag once on mount
  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(flag === 'true');
      } catch {
        setHasSeenOnboarding(false);
      } finally {
        setOnboardingChecked(true);
      }
    })();
  }, []);

  // Show loading spinner while checking authentication or onboarding flag
  if (!auth || auth.isLoading || !onboardingChecked) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.light.tint 
      }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ 
          color: 'white', 
          marginTop: 16, 
          fontSize: 16,
          fontWeight: '500'
        }}>
          Checking session...
        </Text>
      </View>
    );
  }

  // If onboarding not seen yet, redirect there first
  if (hasSeenOnboarding === false) {
    return <Redirect href="/onboarding" />;
  }

  // Auto-navigate based on authentication status
  console.log('🔄 Auto-navigation: isAuthenticated =', auth.isAuthenticated, 'isGuest =', auth.isGuest);
  
  if (auth.isAuthenticated) {
    console.log('✅ User is authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  } else if (auth.isGuest) {
    console.log('👤 Guest mode detected, redirecting to profiles');
    return <Redirect href="/(tabs)/profiles" />;
  } else {
    console.log('❌ User not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }
}
