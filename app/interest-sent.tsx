import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const sentInterests = [
  { id: '1', name: 'Veena', image: 'https://images.unsplash.com/photo-1619981943232-5643b5e4053a?q=80&w=1887&auto=format&fit=crop' },
];

export default function InterestSentScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Sent');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interests</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          They're into you! you're into them too, like them back to match instantly.
        </Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('Sent')}>
            <Text style={[styles.tab, activeTab === 'Sent' && styles.activeTab]}>Sent</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Declined')}>
            <Text style={[styles.tab, activeTab === 'Declined' && styles.activeTab]}>Declined</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Sent' && (
          <View style={styles.profileCard}>
            <Image source={{ uri: sentInterests[0].image }} style={styles.profileImage} />
            <Text style={styles.profileName}>{sentInterests[0].name}</Text>
            <TouchableOpacity style={styles.remindButton}>
              <Text style={styles.remindButtonText}>Remind</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    fontSize: 16,
    color: 'gray',
    marginRight: 20,
    paddingBottom: 5,
  },
  activeTab: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: 200,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  remindButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  remindButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
