import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import VerificationBadge from '../../components/VerificationBadge';

// Removed hardcoded profiles - now using real API data

const ProfileCard = ({ item, onPress, t }: { item: any, onPress: () => void, t: (key: string) => string }) => {
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
    const membershipType = item?.membership_type?.toLowerCase();
    const packageId = item?.package_id || 0;
    
    if (membershipType === 'premium' || packageId === 1 || packageId === 2) return 'premium';
    if (membershipType === 'elite' || packageId === 3) return 'elite';
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
            <VerificationBadge size={16} style={{ marginLeft: 5 }} />
          )}
        </View>
        <Text style={styles.profileDetail}>{t('age')}: {age}</Text>
        <Text style={styles.profileDetail}>{t('height')}: {height}</Text>
        <Text style={styles.profileDetail}>{t('location')}: {location}</Text>
        <Text style={styles.profileDetail}>{t('id')}: {profileId}</Text>
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
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab || 'Recommended Matches');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalProfiles, setTotalProfiles] = useState(0);

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

  const fetchUserData = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setCurrentPage(1);
        setHasMorePages(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log('📊 Fetching profiles data...');
      console.log('🎯 Active tab:', activeTab, 'Page:', page);
      
      // Determine the type based on active tab
      let profileType = 'all';
      
      if (activeTab === 'Recommended Matches') {
        profileType = 'new_matches';
      } else if (activeTab === 'Newly joined') {
        profileType = 'newly_joined';
      } else if (activeTab === 'All Profiles') {
        profileType = 'all';
      }
      
      console.log('🔄 Profile type determined:', profileType);
      
      // Fetch profiles using real API with pagination
      const profilesResponse = await apiService.getProfiles({
        type: profileType,
        limit: 20,
        page: page
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
        
        // Handle pagination data
        const pagination = profilesResponse.data.pagination;
        if (pagination) {
          setCurrentPage(pagination.current_page);
          setHasMorePages(pagination.has_more || pagination.current_page < pagination.last_page);
          setTotalProfiles(pagination.total);
          console.log('📄 Pagination info:', pagination);
        }
        
        // Append or replace profiles based on append flag
        if (append) {
          setProfiles(prevProfiles => [...prevProfiles, ...processedProfiles]);
        } else {
          setProfiles(processedProfiles);
        }
      } else {
        console.log('⚠️ Profiles API returned invalid response structure');
        console.log('📋 Response structure:', JSON.stringify(profilesResponse, null, 2));
        if (!append) {
          setProfiles([]);
        }
      }
    } catch (error: any) {
      console.error('💥 Error fetching profiles:', error);
      console.error('💥 Error details:', error?.message || 'Unknown error');
      console.error('💥 Error stack:', error?.stack || 'No stack trace');
      if (!append) {
        setProfiles([]);
      }
      console.log('🔄 No profiles available due to error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      console.log('⏹️ Profiles loading complete');
    }
  };

  // Load more profiles for endless scroll
  const loadMoreProfiles = async () => {
    if (!hasMorePages || loadingMore) return;
    
    const nextPage = currentPage + 1;
    console.log('📄 Loading more profiles, page:', nextPage);
    await fetchUserData(nextPage, true);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Feather name="users" size={20} color={Colors.light.tint} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>{t('profiles')}</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput 
            placeholder={t('search_by_name')}
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
        <TouchableOpacity onPress={() => setActiveTab('Recommended Matches')}>
          <Text style={[styles.tabText, activeTab === 'Recommended Matches' && styles.activeTabText]}>{t('recommended_matches')}</Text>
          {activeTab === 'Recommended Matches' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Newly joined')}>
          <Text style={[styles.tabText, activeTab === 'Newly joined' && styles.activeTabText]}>{t('newly_joined')}</Text>
          {activeTab === 'Newly joined' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('All Profiles')}>
          <Text style={[styles.tabText, activeTab === 'All Profiles' && styles.activeTabText]}>{t('all_profiles')}</Text>
          {activeTab === 'All Profiles' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>{t('loading_profiles')}</Text>
        </View>
      ) : profiles.length > 0 ? (
        <FlatList
          data={profiles}
          renderItem={({ item }) => (
            <ProfileCard 
              item={item} 
              t={t}
              onPress={() => router.push(`/profile/${item?.id || '1'}`)} 
            />
          )}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
          onEndReached={loadMoreProfiles}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.light.tint} />
                <Text style={styles.loadMoreText}>Loading more profiles...</Text>
              </View>
            ) : hasMorePages ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProfiles}>
                <Text style={styles.loadMoreButtonText}>Load More ({totalProfiles - profiles.length} remaining)</Text>
              </TouchableOpacity>
            ) : profiles.length > 0 ? (
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>You've seen all {totalProfiles} profiles!</Text>
              </View>
            ) : null
          )}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('no_profiles_found')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerCenter: { 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  loadMoreContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  loadMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.light.icon,
  },
  loadMoreButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 20,
    alignSelf: 'center',
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  endOfListContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 16,
    color: Colors.light.icon,
    fontWeight: '500',
  },
});