import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ImageBackground, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { mockProfiles } from '../(tabs)/profiles';

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface TagProps {
  icon?: keyof typeof Feather.glyphMap;
  text: string;
  highlight?: boolean;
}

const Tag: React.FC<TagProps> = ({ icon, text, highlight }) => (
  <View style={[styles.tag, highlight && styles.tagHighlight]}>
    {icon && <Feather name={icon} size={14} color={highlight ? 'white' : Colors.light.tint} />}
    <Text style={[styles.tagText, highlight && styles.tagTextHighlight]}>{text}</Text>
  </View>
);

const { width } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

    const profile = mockProfiles.all.find(p => p.id === id);

  if (profile && !profile.images) {
    profile.images = [profile.image];
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <FlatList
            data={profile.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <ImageBackground source={{ uri: item }} style={[styles.profileImage, { width }]}>
                <View style={styles.imageOverlay} />
              </ImageBackground>
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortlistButton}>
              <Feather name="heart" size={30} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          {profile.images.length > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>{currentIndex + 1} / {profile.images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}><Feather name="share-2" size={20} color="white" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Feather name="download" size={20} color="white" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Feather name="bookmark" size={20} color="white" /></TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>About me</Text>
            <View style={styles.tagsContainer}>
              <Tag icon="user" text={profile.height} />
              <Tag icon="calendar" text={profile.dob} />
              <Tag icon="book" text={profile.education} />
              <Tag icon="info" text={profile.born} />
              <Tag icon="star" text={profile.star} />
              <Tag icon="moon" text={profile.rassi} />
              <Tag icon="droplet" text={profile.bloodGroup} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional Details</Text>
            <View style={styles.tagsContainer}>
              <Tag icon="briefcase" text={profile.job} />
              <Tag icon="dollar-sign" text={profile.salary} />
              <Tag icon="map-pin" text={`Job Location - ${profile.location}`} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Horoscope Details</Text>
            <DetailItem label="Place of Birth" value={profile.birthPlace} />
            <DetailItem label="Time of Birth" value={profile.birthTime} />
            <DetailItem label="Raasi" value={profile.rassi} />
            <DetailItem label="Star" value={profile.star} />
            <DetailItem label="Patham" value={profile.patham} />
            <DetailItem label="Lagnam" value={profile.lagnam} />
            <DetailItem label="Horoscope type" value={profile.horoscopeType} />
            <DetailItem label="Dosham type" value={profile.doshamType} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Family Details</Text>
            <DetailItem label="Father Name" value={profile.fatherName} />
            <DetailItem label="Father Occupation" value={profile.fatherOccupation} />
            <DetailItem label="Mother Name" value={profile.motherName} />
            <DetailItem label="Mother Occupation" value={profile.motherOccupation} />
            <DetailItem label="Siblings" value={profile.siblings} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Other Details</Text>
            <DetailItem label="Married" value={profile.married} />
            <DetailItem label="Own House" value={profile.ownHouse} />
            <DetailItem label="Own Plot" value={profile.ownPlot} />
            <DetailItem label="Family Status" value={profile.familyStatus} />
          </View>

          
          
          
          
                  </View>
      </ScrollView>
      <TouchableOpacity style={styles.sendInterestButton}>
        <Feather name="send" size={20} color="white" />
        <Text style={styles.sendInterestButtonText}>Send Interest</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  imageContainer: {
    width: '100%',
    height: 400,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButtons: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {},
  shortlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  paginationText: {
    color: 'white',
    fontSize: 14,
  },
  contentContainer: {
    padding: 15,
    marginTop: -50,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: Colors.light.tint,
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  tagHighlight: {
    backgroundColor: Colors.light.tint,
  },
  tagText: {
    marginLeft: 8,
    color: Colors.light.tint,
    fontSize: 14,
  },
  tagTextHighlight: {
    color: 'white',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sendInterestButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  sendInterestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
  },
});
