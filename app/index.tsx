import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000); // Navigate after 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Manavaagai</Text>
        <Text style={styles.subtitle}>Bringing Hearts Together</Text>
        <Text style={styles.journeyText}>Start your Life Journey here...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginTop: 4,
  },
  journeyText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 16,
    color: Colors.light.icon,
  },
});





