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
  <View style={styles.detailItemContainer}>
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
  <View style={[styles.tag, highlight && styles.highlightTag]}>
    {icon && <Feather name={icon} size={14} color="#6B7280" style={{ marginRight: 6 }} />}
    <Text style={[styles.tagText, highlight && styles.highlightTagText]}>{text}</Text>
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

    const allProfiles = [...mockProfiles.all, ...mockProfiles.newlyJoined];
  const profile = allProfiles.find(p => p.id === id);

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

          <View style={styles.tagsContainer}>
            <Tag icon="briefcase" text={profile.job} highlight />
            <Tag icon="map-pin" text={profile.location} />
            <Tag icon="user" text={profile.maritalStatus} />
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Basic Details</Text>
            <DetailItem label="Height" value={profile.height} />
            <DetailItem label="Date of Birth" value={profile.dob} />
            <DetailItem label="Education" value={profile.education} />
            <DetailItem label="Born" value={profile.born} />
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Horoscope Details</Text>
            <DetailItem label="Star" value={profile.star} />
            <DetailItem label="Raasi" value={profile.rassi} />
            <DetailItem label="Blood Group" value={profile.bloodGroup} />
            <DetailItem label="Marital status" value={profile.maritalStatus} />
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Professional Details</Text>
            <DetailItem label="Job" value={profile.job} />
            <DetailItem label="Salary" value={profile.salary} />
            <DetailItem label="Location" value={profile.location} />
            <DetailItem label="Birth place" value={profile.birthPlace} />
            <DetailItem label="Birth time" value={profile.birthTime} />
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Family Details</Text>
            <DetailItem label="Father's name" value={profile.fatherName} />
            <DetailItem label="Father's occupation" value={profile.fatherOccupation} />
            <DetailItem label="Mother's name" value={profile.motherName} />
            <DetailItem label="Mother's occupation" value={profile.motherOccupation} />
            <DetailItem label="Siblings" value={profile.siblings} />
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Other Details</Text>
            <DetailItem label="Own house" value={profile.ownHouse} />
            <DetailItem label="Own plot" value={profile.ownPlot} />
            <DetailItem label="Family status" value={profile.familyStatus} />
            <DetailItem label="Family type" value={profile.familyType} />
            <DetailItem label="Diet" value={profile.diet} />
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
  container: { flex: 1, backgroundColor: 'white' },
    imageContainer: { height: 500 },
  profileImage: { height: '100%', justifyContent: 'flex-end' },
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
    paginationText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    contentContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, paddingBottom: 120, paddingHorizontal: 20 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  profileName: { fontSize: 24, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row' },
  actionButton: { backgroundColor: 'black', borderRadius: 20, padding: 10, marginLeft: 10 },
  card: { paddingHorizontal: 20, marginTop: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, marginBottom: 10 },
  tagText: { fontSize: 14, color: '#374151' },
  highlightTag: { backgroundColor: '#E5E7EB' },
  highlightTagText: { color: '#4B5563' },
    detailItemContainer: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
    sendInterestButton: { flexDirection: 'row', backgroundColor: Colors.light.tint, padding: 20, alignItems: 'center', justifyContent: 'center', margin: 15, borderRadius: 12, position: 'absolute', bottom: 0, left: 15, right: 15 },
  sendInterestButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});
