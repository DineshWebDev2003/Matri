import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const interests = [
  { id: '1', name: 'Divya Dia', message: 'I am interested in your profile', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '2', name: 'Vaishali', message: 'Hey, let\'s connect!', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

export default function InterestReceivedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interest Received</Text>
      </View>

      <FlatList
        data={interests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.interestCard}>
            <Image source={{ uri: item.image }} style={styles.profileImage} />
            <View style={styles.interestInfo}>
              <Text style={styles.interestName}>{item.name}</Text>
              <Text style={styles.interestMessage}>{item.message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.acceptButton}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineButton}>
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
      />
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
    fontWeight: 'bold' 
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  interestInfo: {
    flex: 1,
  },
  interestName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  interestMessage: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  declineButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  declineButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
