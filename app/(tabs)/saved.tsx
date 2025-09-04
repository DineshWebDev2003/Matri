import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const savedProfiles = [
  { id: '1', name: 'Pooja', location: '26, Trichy', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop' },
  { id: '2', name: 'Shivanya', location: '25, Chennai', image: 'https://images.unsplash.com/photo-1514315384764-9b4978583e8e?q=80&w=1887&auto=format&fit=crop' },
];

export default function SavedScreen() {
  const router = useRouter();

  const renderProfile = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/profile/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.profileName}>{item.name}</Text>
          <Text style={styles.profileLocation}>{item.location}</Text>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Feather name="bookmark" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={savedProfiles}
        renderItem={renderProfile}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileLocation: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  bookmarkButton: {
    backgroundColor: Colors.light.tint,
    padding: 8,
    borderRadius: 20,
  },
});