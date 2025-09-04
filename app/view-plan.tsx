import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ViewPlanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <LinearGradient colors={['#C6222F', '#A11A25']} style={styles.planCard}>
        <Text style={styles.planName}>Premium Plan</Text>
        <Text style={styles.planPrice}>$99.99 / month</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✓ Access to all profiles</Text>
          <Text style={styles.featureItem}>✓ Unlimited messaging</Text>
          <Text style={styles.featureItem}>✓ Advanced search filters</Text>
          <Text style={styles.featureItem}>✓ Profile boost</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planCard: {
    margin: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 22,
    color: 'white',
    marginBottom: 30,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
});
