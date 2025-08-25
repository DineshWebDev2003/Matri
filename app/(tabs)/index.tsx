import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, TextInput, FlatList, ImageBackground } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const banners = [
  { id: '1', title: 'Meet and Greet', location: 'Vadapalani, Chennai', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', title: 'Music Festival', location: 'ECR, Chennai', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' },
  { id: '3', title: 'Art Expo', location: 'Nungambakkam, Chennai', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop' },
];

const stats = [
  { label: 'Shortlisted by me', value: '06', color: '#EF4444', route: '/shortlisted' },
  { label: 'Viewed your profile', value: '07', color: '#60A5FA', route: '/viewed-profile' },
  { label: 'Interest received', value: '02', color: '#E5E7EB', route: '/interest-received' },
  { label: 'Interest sent', value: '01', color: '#FEF3C7', route: '/interest-sent' },
];

const justJoined = [
  { id: '1', name: 'Shivanya', location: '26, Trichy', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Divya Dia', location: '27, Chennai', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Elsa Perry', location: '22, Ooty', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
];

const newMatches = [
  { id: '4', name: 'Maghilini', location: '26, Trichy', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'Smrithi Sri', location: '27, Chennai', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', name: 'Vaishali', location: '22, Ooty', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hi, Sanjay</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push('/notifications')}><Feather name="bell" size={24} /></TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 15 }}><Feather name="sliders" size={24} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." style={styles.searchInput} />
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={banners}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ImageBackground source={{ uri: item.image }} style={styles.banner} imageStyle={{ borderRadius: 16 }}>
              <View style={styles.bannerOverlay} />
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerLocation}>{item.location}</Text>
            </ImageBackground>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
        />

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} style={[styles.statCard, { backgroundColor: stat.color }]} onPress={() => router.push(stat.route as `http${string}` | `/${string}` | `./${string}` | `../${string}`)}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Just Joined</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={justJoined}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.profileCard}>
              <Image source={{ uri: item.image }} style={styles.profileImage} />
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileLocation}>{item.location}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={newMatches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.profileCard}>
              <Image source={{ uri: item.image }} style={styles.profileImage} />
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileLocation}>{item.location}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  searchInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, marginRight: 10 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10 },
  banner: { width: 300, height: 150, marginRight: 15, justifyContent: 'flex-end', padding: 15 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16 },
  bannerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bannerLocation: { color: 'white', fontSize: 14 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingVertical: 10 },
  statCard: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', marginHorizontal: 5 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  statLabel: { fontSize: 12, color: 'black', marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { color: Colors.light.tint, fontWeight: '600' },
  profileCard: { marginRight: 15, alignItems: 'center' },
  profileImage: { width: 120, height: 120, borderRadius: 16 },
  profileName: { marginTop: 8, fontWeight: 'bold' },
  profileLocation: { fontSize: 12, color: 'gray' },
});