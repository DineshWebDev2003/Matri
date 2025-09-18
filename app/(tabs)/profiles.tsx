import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';

// Removed hardcoded profiles - now using real API data

const ProfileCard = ({ item, onPress }: { item: any, onPress: () => void }) => {
  // Safe access to profile properties
  const profileName = item?.name || `${item?.firstname || 'Unknown'} ${item?.lastname || ''}`.trim();
  const profileId = item?.idNo || `USR${item?.id?.toString().padStart(5, '0') || '00000'}`;
  const profileImage = item?.images?.[0] || (item?.image ? `https://app.90skalyanam.com/assets/images/user/profile/${item.image}` : null);
  const age = item?.age || 'N/A';
  const height = item?.height || 'N/A';
  const location = item?.location || item?.city || 'N/A';
  const isVerified = item?.verified === 1 || item?.verified === true || item?.is_verified === 1 || item?.kycVerified || item?.emailVerified || item?.mobileVerified;
  
  // Determine membership tier
  const getMembershipTier = () => {
    if (item?.premium || item?.membership_type === 'premium') return 'premium';
    if (item?.elite || item?.membership_type === 'elite') return 'elite';
    return 'basic';
  };
  
  const membershipTier = getMembershipTier();
  
  return (
    <TouchableOpacity style={[styles.profileCard, item?.premium && styles.premiumCard]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <ProfileImage 
          imageUrl={profileImage}
          name={profileName}
          size={80}
          isVerified={isVerified}
          showBadge={true}
        />
        {/* Membership Tier Tag */}
        <View style={[
          styles.membershipTag,
          membershipTier === 'premium' ? styles.premiumTag : 
          membershipTier === 'elite' ? styles.eliteTag : styles.basicTag
        ]}>
          <Text style={[
            styles.membershipTagText,
            membershipTier === 'premium' ? styles.premiumTagText : styles.basicTagText
          ]}>
            {membershipTier.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.profileInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.profileName}>{profileName}</Text>
          {isVerified && (
            <Feather name="check-circle" size={16} color="#007AFF" style={{ marginLeft: 5 }} />
          )}
        </View>
        <Text style={styles.profileDetail}>Age: {age}</Text>
        <Text style={styles.profileDetail}>Height: {height}</Text>
        <Text style={styles.profileDetail}>Location: {location}</Text>
        <Text style={styles.profileDetail}>ID: {profileId}</Text>
      </View>
      <TouchableOpacity style={styles.heartIcon}>
        <Feather name="heart" size={20} color={Colors.light.icon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ProfilesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initialTab } = params;

  const [activeTab, setActiveTab] = useState(initialTab || 'New Matches');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as string);
    }
    fetchUserData();
  }, [initialTab, activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUserData();
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Searching for:', searchQuery);
      
      const searchResponse = await apiService.searchMembers({
        query: searchQuery,
        limit: 20
      });
      
      if (searchResponse && searchResponse.status === 'success' && searchResponse.data?.profiles) {
        setProfiles(searchResponse.data.profiles);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching profiles data...');
      console.log('🎯 Active tab:', activeTab);
      
      // Determine the type and filters based on active tab
      let profileType = 'all';
      let filters = {};
      
      if (activeTab === 'New Matches') {
        profileType = 'new_matches';
        // Add account requirement matching logic
        filters = {
          match_preferences: true,
          age_range: true,
          location_preference: true
        };
      } else if (activeTab === 'Newly joined') {
        profileType = 'newly_joined';
        // Show users created within last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filters = {
          created_after: oneWeekAgo.toISOString().split('T')[0]
        };
      } else if (activeTab === 'All Profiles') {
        profileType = 'all';
        // Show users up to 60+ years
        filters = {
          max_age: 65
        };
      }
      
      console.log('🔄 Profile type determined:', profileType);
      console.log('🎯 Filters applied:', filters);
      
      // Fetch profiles using real API
      const profilesResponse = await apiService.getProfiles({
        type: profileType,
        limit: 20,
        ...filters
      });

      console.log('👥 Profiles API response:', profilesResponse);

      if (profilesResponse && profilesResponse.status === 'success' && profilesResponse.data && profilesResponse.data.profiles) {
        const realProfiles = profilesResponse.data.profiles;
        console.log('✅ Real profiles fetched:', realProfiles.length);
        
        // Process profiles to ensure proper data structure
        const processedProfiles = realProfiles.map((profile: any) => {
          return {
            ...profile,
            // Ensure name is properly constructed
            name: profile.name || `${profile.firstname || ''} ${profile.lastname || ''}`.trim(),
            // Ensure profile ID is formatted correctly
            idNo: profile.idNo || `USR${profile.id?.toString().padStart(5, '0') || '00000'}`,
            // Ensure image URL is complete
            images: profile.images || (profile.image ? [`https://app.90skalyanam.com/assets/images/user/profile/${profile.image}`] : ['https://randomuser.me/api/portraits/women/1.jpg']),
            // Ensure basic info is available
            age: profile.age || 'N/A',
            height: profile.height || 'N/A',
            location: profile.location || profile.city || 'N/A'
          };
        });
        
        console.log('🔄 Processed profiles:', processedProfiles.length);
        
        setProfiles(processedProfiles);
      } else {
        console.log('⚠️ Profiles API returned invalid response structure');
        console.log('📋 Response structure:', JSON.stringify(profilesResponse, null, 2));
        setProfiles([]);
      }
    } catch (error) {
      console.error('💥 Error fetching profiles:', error);
      console.error('💥 Error details:', error.message);
      console.error('💥 Error stack:', error.stack);
      setProfiles([]);
      console.log('🔄 No profiles available due to error');
    } finally {
      setLoading(false);
      console.log('⏹️ Profiles loading complete');
    }
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Profiles</Text>
              </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput 
            placeholder="Search by name, caste, or profile ID..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="search" size={20} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('New Matches')}>
          <Text style={[styles.tabText, activeTab === 'New Matches' && styles.activeTabText]}>New Matches</Text>
          {activeTab === 'New Matches' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Newly joined')}>
          <Text style={[styles.tabText, activeTab === 'Newly joined' && styles.activeTabText]}>Newly joined</Text>
          {activeTab === 'Newly joined' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('All Profiles')}>
          <Text style={[styles.tabText, activeTab === 'All Profiles' && styles.activeTabText]}>All Profiles</Text>
          {activeTab === 'All Profiles' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      ) : profiles.length > 0 ? (
        <FlatList
          data={profiles}
          renderItem={({ item }) => (
            <ProfileCard 
              item={item} 
              onPress={() => router.push(`/profile/${item?.id || '1'}`)} 
            />
          )}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No profiles found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchSection: { padding: 20, backgroundColor: 'white' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 16 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10, margin: 5 },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: 'white' },
  tabText: { color: Colors.light.icon, fontWeight: '600', fontSize: 16, paddingBottom: 10 },
  activeTabText: { color: Colors.light.text },
  activeTabIndicator: { height: 3, backgroundColor: Colors.light.tint, position: 'absolute', bottom: 0, left: 0, right: 0 },
  listContainer: { paddingHorizontal: 20, paddingTop: 10 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  premiumCard: { backgroundColor: '#FFFBEB' },
  profileImage: { width: 80, height: 100, borderRadius: 10 },
  profileInfo: { flex: 1, marginLeft: 15, alignSelf: 'flex-start' },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileDetail: { color: Colors.light.icon, marginTop: 4, fontSize: 14 },
  heartIcon: { position: 'absolute', top: 15, right: 15 },
  imageContainer: { position: 'relative' },
  membershipTag: {
    position: 'absolute',
    top: -5,
    left: -5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  basicTag: { backgroundColor: '#FF4444' },
  premiumTag: { backgroundColor: '#FFD700' },
  eliteTag: { backgroundColor: '#FF4444' },
  membershipTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  basicTagText: { color: 'white' },
  premiumTagText: { color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.light.icon },
});