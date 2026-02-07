import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';
import { dropdowns } from '../services/dropdowns';
import UniversalHeader from '../components/UniversalHeader';

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const auth = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, name, caste, age, location
  const [religionOptions,setReligionOptions]=useState<{id:string;name:string}[]>([]);
  const [casteOptions,setCasteOptions]=useState<{id:string;name:string}[]>([]);
  const [selectedReligion,setSelectedReligion]=useState('');
  const [selectedCaste,setSelectedCaste]=useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1F2937' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    inputBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F3F4F6' },
  };

  // load religions once
  useEffect(()=>{(async()=>{
    try{
      const res = await dropdowns.religions();
      const relArr = Array.isArray(res)
        ? res.map((r:any)=>({ label:r.name??r.label??r, value:String(r.id??r.value??r.key??r) }))
        : Object.entries(res||{}).map(([id,val]:any)=>({ label:String(val?.name??val), value:String(id) }));
      setReligionOptions(relArr);
    }catch(e){console.warn('religion fetch err',e);}}
  )();},[]);

  // auto-set user religion and caste for caste filter
  useEffect(() => {
    const setupCasteSearch = async () => {
      if (filterType === 'caste' && auth.user) {
        if (auth.user.religion && !selectedReligion) {
          setSelectedReligion(auth.user.religion);
          await handleReligionChange(auth.user.religion);
        }
        if (auth.user.caste && !selectedCaste) {
          setSelectedCaste(auth.user.caste);
        }
        // Auto perform search for caste profiles
        await performSearch();
      }
    };
    setupCasteSearch();
  }, [filterType, auth.user]);

  const handleReligionChange=async(id:string)=>{
    setSelectedReligion(id);
    setSelectedCaste('');
    if(id){
      try {
        const res = await dropdowns.castes(Number(id));
        const castArr = Array.isArray(res)
          ? res.map((c:any)=>({ label:c.name??c.label??c.caste??c.title??String(c), value:String(c.id??c.value??c.key??c) }))
          : Object.entries(res||{}).map(([cid,val]:any)=>({ label:String(val?.name??val), value:String(cid) }));
        setCasteOptions(castArr);
      } catch {
        setCasteOptions([]);
      }
    }else{setCasteOptions([]);}
  };

  const performSearch = async () => {
    if (filterType !== 'caste' && !searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      console.log(`🔍 Searching (${filterType}) query:`, searchQuery);

      // Build search parameters for getProfiles helper which already handles endpoint differences
      const params: any = {
        search: searchQuery,
        limit: filterType === 'caste' ? 10 : 100,
        page: 1,
      };

      if (filterType === 'name') {
        params.search = searchQuery;
        console.log('📝 Searching by name:', searchQuery);
      } else if (filterType === 'location') {
        params.filters = { location: searchQuery };
        console.log('📍 Searching by location:', searchQuery);
      } else if (filterType === 'caste') {
        params.filters = {};
        if(selectedCaste){
          params.filters.caste = selectedCaste;
        } else {
          params.filters.caste = searchQuery;
        }
        if(selectedReligion) params.filters.religion = selectedReligion;
        console.log('👥 Searching by caste:', params);
      } else if (filterType === 'age') {
        const age = parseInt(searchQuery);
        if (isNaN(age)) {
          Alert.alert('Error', 'Please enter a valid age');
          setLoading(false);
          return;
        }
        params.filters = { age };
      }
      // other filter types default to search param only

      // Call API with search parameters
      const response = await apiService.getProfiles(params);
      console.log('📊 Search response:', JSON.stringify(response, null, 2));

      if (response?.status === 'success' && response?.data) {
        const profiles = Array.isArray(response.data) 
          ? response.data 
          : response.data.profiles || response.data.users || [];

        console.log('📋 Profiles extracted:', profiles.length);
        
        if (profiles.length > 0) {
          setSearchResults(profiles);
          setCurrentPage(1);
          const limitUsed = filterType === 'caste' ? 10 : 100;
          setHasMore(profiles.length === limitUsed);
          console.log(`✅ Found ${profiles.length} profiles`);
        } else {
          setSearchResults([]);
          setCurrentPage(1);
          setHasMore(false);
          console.log('⚠️ No profiles found');
          Alert.alert('No Results', `No profiles found matching your ${filterType} search`);
        }
      } else if(response?.remark==='profile_incomplete'||response?.data?.remark==='profile_incomplete'){
        console.warn('⏩ Backend blocked search due to incomplete profile. Fallback to generic profiles and client-side filtering');
        // generic fetch
        const generic = await apiService.getProfiles({ type: 'all', limit: 200, page:1 });
        if(generic?.status==='success'&&generic?.data?.profiles){
          let profiles:any[]=generic.data.profiles;
          if(filterType==='location'){
            const q = searchQuery.toLowerCase();
            profiles=profiles.filter((p:any)=> (p.location||p.city||'').toLowerCase().includes(q));
          }else if(filterType==='name'){
            const q=searchQuery.toLowerCase();
            profiles=profiles.filter((p:any)=> (`${p.firstname||''} ${p.lastname||''}`).toLowerCase().includes(q));
          }
          setSearchResults(profiles);
        }else{
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setCurrentPage(1);
        setHasMore(false);
        console.log('⚠️ Error response:', response);
        Alert.alert('Error', response?.message || 'No profiles found matching your search');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      Alert.alert('Error', 'Failed to search profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !hasSearched) return;

    setLoadingMore(true);

    try {
      const params: any = {
        limit: filterType === 'caste' ? 10 : 100,
        page: currentPage + 1,
      };

      if (filterType === 'name') {
        params.search = searchQuery;
      } else if (filterType === 'location') {
        params.filters = { location: searchQuery };
      } else if (filterType === 'caste') {
        params.filters = {};
        if(selectedCaste){
          params.filters.caste = selectedCaste;
        }
        if(selectedReligion) params.filters.religion = selectedReligion;
      } else if (filterType === 'age') {
        params.filters = { age: parseInt(searchQuery) };
      }

      const response = await apiService.getProfiles(params);
      console.log('📊 Load more response:', JSON.stringify(response, null, 2));

      if (response?.status === 'success' && response?.data) {
        const newProfiles = Array.isArray(response.data) 
          ? response.data 
          : response.data.profiles || response.data.users || [];

        setSearchResults(prev => [...prev, ...newProfiles]);
        setCurrentPage(prev => prev + 1);
        setHasMore(newProfiles.length === (filterType === 'caste' ? 10 : 100));
        console.log(`✅ Loaded ${newProfiles.length} more profiles`);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Load more error:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
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

  const renderProfileCard = ({ item }: { item: any }) => {
    const userGender = (item?.gender || '').toLowerCase();
    const defaultImg = userGender === 'female'
      ? require('../assets/images/female_avatar.webp')
      : require('../assets/images/male_avatar.webp');

    const profileName = item?.name || `${item?.firstname || ''} ${item?.lastname || ''}`.trim() || 'User';
    const age = calculateAge(item?.dateOfBirth || item?.dob) || item?.age;
    const location = item?.city || item?.location || 'N/A';
    const imageUrl = item?.image
      ? item.image.startsWith('http')
        ? item.image
        : `https://90skalyanam.com/assets/images/user/profile/${item.image}`
      : null;

    return (
      <View style={[styles.profileCardContainer, themeStyles.container]}>
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push(`/profile/${item.id}`)}
        >
          <Image
            source={imageUrl ? { uri: imageUrl } : defaultImg}
            style={styles.profileImage}
            defaultSource={defaultImg}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, themeStyles.text]}>
              {profileName}, {age || 'N/A'}
            </Text>
            <View style={styles.profileDetails}>
              <Feather name="map-pin" size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.profileDetailText, themeStyles.secondaryText]}>
                {location}
              </Text>
            </View>
            {item.caste && (
              <View style={styles.profileDetails}>
                <Feather name="users" size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.profileDetailText, themeStyles.secondaryText]}>
                  {item.caste}
                </Text>
              </View>
            )}
            {item.religion && (
              <View style={styles.profileDetails}>
                <Feather name="heart" size={14} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.profileDetailText, themeStyles.secondaryText]}>
                  {item.religion}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />

      {/* Header with Search Section - Match index.tsx styling */}
      <View style={[styles.headerWithSearch, themeStyles.container]}>
        <UniversalHeader 
          title="Search Profiles"
          showProfileImage={false}
          leftIcon="back"
          onLeftIconPress={() => router.back()}
        />

        {/* Search Section */}
        <View style={styles.searchSection}>
        {filterType !== 'caste' && (
          <>
        {/* Search Input */}
        <View style={[styles.searchInputContainer, themeStyles.inputBg]}>
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            style={[styles.searchInput, themeStyles.text]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
          />
        </View>
        </>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'name', 'location', 'age', 'caste'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                filterType === type && styles.filterTabActive,
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterType === type ? { color: '#FFFFFF' } : themeStyles.secondaryText,
                ]}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filterType !== 'caste' && (
          <>
        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={performSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
        </>
        )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Searching...</Text>
        </View>
      ) : !hasSearched ? (
        <View style={styles.centerContainer}>
          <Feather name="search" size={64} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>Search Profiles</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            Enter a search query and select a filter type to find profiles
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="inbox" size={64} color={theme === 'dark' ? '#6B7280' : '#D1D5DB'} />
          <Text style={[styles.emptyTitle, themeStyles.text]}>No Results</Text>
          <Text style={[styles.emptyText, themeStyles.secondaryText]}>
            No profiles found matching your search
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => loadingMore ? <ActivityIndicator size="small" color={Colors.light.tint} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWithSearch: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: Colors.light.tint,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileCardContainer: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileDetailText: {
    fontSize: 12,
  },
});
