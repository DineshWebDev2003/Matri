import React, { useCallback, useMemo } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import AppIntroSlider, { AppIntroSliderProps } from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

interface Slide {
  key: string;
  title: string;
  text: string;
  image: any;
  backgroundColor: string;
}

export default function Onboarding() {
  const router = useRouter();

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 'one',
        title: 'Welcome to 90s Kalyanam',
        text: 'Find your perfect match effortlessly with our AI-powered recommendations.',
        image: require('../assets/images/onboarding1.png'),
        backgroundColor: '#e53935',
      },
      {
        key: 'two',
        title: 'Connect & Chat',
        text: 'Start conversations securely and build meaningful relationships.',
        image: require('../assets/images/onboarding2.png'),
        backgroundColor: '#f79b11ff',
      },
      {
        key: 'three',
        title: 'Premium Features',
        text: 'Unlock premium to enjoy unlimited swipes, boosts and more.',
        image: require('../assets/images/onboarding3.png'),
        backgroundColor: '#16eea6ff',
      },
    ],
    [],
  );

  const markSeenAndContinue = useCallback(async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch {}
    router.replace('/');
  }, [router]);

  const renderItem: AppIntroSliderProps<Slide>['renderItem'] = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={markSeenAndContinue}
      onSkip={markSeenAndContinue}
      showSkipButton
      activeDotStyle={styles.activeDot}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  activeDot: {
    backgroundColor: Colors.light.tint,
  },
});
