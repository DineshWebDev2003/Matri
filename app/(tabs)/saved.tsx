import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const mockSavedProfiles = [
  { id: '1', name: 'Meena', age: 27, location: 'Erode', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '2', name: 'Riya', age: 25, location: 'Salem', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const SavedProfileCard = ({ item }) => (
  <View style={styles.profileCard}>
    <Image source={{ uri: item.image }} style={styles.profileImage} />
    <View style={styles.profileInfo}>
      <Text style={styles.profileName}>{item.name}, {item.age}</Text>
      <Text style={styles.profileLocation}>{item.location}</Text>
    </View>
    <TouchableOpacity style={styles.unsaveButton}>
      <Feather name="bookmark" size={24} color={Colors.light.tint} />
    </TouchableOpacity>
  </View>
);

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Profiles</Text>
      </View>
      <FlatList
        data={mockSavedProfiles}
        renderItem={({ item }) => <SavedProfileCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved profiles yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  profileCard: { backgroundColor: 'white', borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, flexDirection: 'row', alignItems: 'center', padding: 15 },
  profileImage: { width: 60, height: 60, borderRadius: 30 },
  profileInfo: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileLocation: { color: Colors.light.icon, marginTop: 4 },
  unsaveButton: { padding: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: Colors.light.icon },
});