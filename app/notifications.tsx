import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const notifications = [
  { id: '1', text: 'Vaishali have shortlisted your profile.', color: '#FBBF24' },
  { id: '2', text: 'Shivanya viewed your profile.', color: '#3B82F6' },
  { id: '3', text: 'You have received an interest from Divya Dia.', color: '#E5E7EB' },
  { id: '4', text: 'Elese Perry have accepted your interest.', color: '#F3F4F6' },
  { id: '5', text: 'Smirth Sri rejected your interest.', color: '#D1D5DB' },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={[styles.colorBar, { backgroundColor: item.color }]} />
      <Text style={styles.notificationText}>{item.text}</Text>
      <TouchableOpacity style={styles.closeButton}>
        <Feather name="x" size={18} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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
    transform: [{ translateX: -12 }],
  },
  listContainer: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorBar: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
});
