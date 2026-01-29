import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isFreeUser } from '../../utils/membership';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, FlatList, ImageBackground, Animated, SafeAreaView, Dimensions, RefreshControl, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ProfileCard } from './profiles';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import { usePremiumModal } from '../../context/PremiumModalContext';
import MenuModal from '../../components/MenuModal';
import UniversalHeader from '../../components/UniversalHeader';
// import WithSwipe from '../../components/WithSwipe';
import { LinearGradient } from 'expo-linear-gradient';
import MiniProfileCard from '../../components/MiniProfileCard';

const { width } = Dimensions.get('window');

// Calculate age from date of birth
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

// Religion images mapping
const religionImages = {
  '1': require('../../assets/images/hindu.png'), // Hindu
  '2': require('../../assets/images/muslim.png'), // Muslim
  '3': require('../../assets/images/cristianq.png'), // Christian
  'hindu': require('../../assets/images/hindu.png'),
  'muslim': require('../../assets/images/muslim.png'),
  'christian': require('../../assets/images/cristianq.png'),
};

// Get user's religion image
const getUserReligionImage = (userReligion: string | undefined) => {
  if (!userReligion) return null;
  return religionImages[userReligion as keyof typeof religionImages];
};

// Religion names mapping
const religionNames = {
  '1': 'Hindu',
  '2': 'Muslim',
  '3': 'Christian',
};

const banners = [
  { id: '1', title: 'Meet and Greet', location: 'Vadapalani, Chennai', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', title: 'Music Festival', location: 'ECR, Chennai', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' },
  { id: '3', title: 'Art Expo', location: 'Nungambakkam, Chennai', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop' },
];

// Stats will be fetched from API - no hardcoded values

export default function HomeScreen() {
  const { showPremiumModal } = usePremiumModal();
  const auth = useAuth();
  const loggedUser = auth.user;
  const isFreePlan = Number(loggedUser?.package_id||0) === 4;
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedBanner, setSelectedBanner] = useState(0);
  // Rotation for religion banner images
  const rotationImages = [
    require('../../assets/images/hindu.png'),
    require('../../assets/images/muslim.png'),
    require('../../assets/images/cristianq.png'),
  ];
  const stars ='***************'
  const taglineText = 'Find your best match in 90skalyanam Matrimony';
  const [bannerIndex, setBannerIndex] = useState(0);

  // animated opacity values
  const imageOpacity = React.useRef(new Animated.Value(1)).current;

  const animateBanner = () => {
    Animated.timing(imageOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
      setBannerIndex(prev => (prev + 1) % rotationImages.length);
      Animated.timing(imageOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    const timer = setInterval(animateBanner, 5000);
    return () => clearInterval(timer);
  }, []);

  const [newlyJoinedProfiles, setNewlyJoinedProfiles] = useState([]);
  const [interestingProfiles, setInterestingProfiles] = useState<Set<string>>(new Set());
  const [newMatchesProfiles, setNewMatchesProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [featuresModalVisible, setFeaturesModalVisible] = useState(false);
  const scrollX = new Animated.Value(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textAnim = useState(new Animated.Value(0))[0];
  const logoAnim = useState(new Animated.Value(0))[0];
  const cursorOpacity = useState(new Animated.Value(0))[0];
  const [stats, setStats] = useState([
    { 
      label: 'Interest Sent', 
      value: '...', 
      icon: 'send', 
      gradient: ['#10B981', '#059669'], 
      route: '/(tabs)/saved',
      tab: 'sent'
    },
    { 
      label: 'Interest Received', 
      value: '...', 
      icon: 'heart', 
      gradient: ['#EF4444', '#DC2626'], 
      route: '/(tabs)/saved',
      tab: 'received'
    },
    { 
      label: 'New Matches', 
      value: '...', 
      icon: 'users', 
      gradient: ['#8B5CF6', '#7C3AED'], 
      route: '/(tabs)/profiles',
      tab: 'new'
    },
    { 
      label: 'Shortlist', 
      value: '...', 
      icon: 'bookmark', 
      gradient: ['#F59E0B', '#D97706'], 
      route: '/(tabs)/saved',
      tab: 'shortlist'
    },
  ]);

  // Fetch user info
  const fetchUserInfo = async () => {
    if (auth?.token) {
      try {
        const response = await apiService.getUserInfo();
        
        let userData = null;
        if (response.status === 'success' && response.data?.user) {
          userData = response.data.user;
        } else if (response.data?.user) {
          // Handle case where status might not be 'success' but user data exists
          userData = response.data.user;
        } else if (response.data) {
          // Handle case where user data is directly in response.data
          userData = response.data;
        } else {
          // Fallback to auth user data
          userData = auth?.user;
        }
        
        if (userData) {
          setUserInfo(userData);
        }
      } catch (error: any) {
        // Fallback to auth user data if API fails
        if (auth?.user) {
          setUserInfo(auth.user);
        }
      }
    } else if (auth?.user) {
      // Use auth context user data if no token but user exists
      setUserInfo(auth.user);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats...');
      
      // Get interest sent count from interested-profiles API
      let interestSentCount = '0';
      try {
        const sentResponse = await apiService.getHeartedProfiles();
        console.log('📊 Interest sent response:', sentResponse);
        if (sentResponse.status === 'success' && sentResponse.data?.pagination) {
          interestSentCount = (sentResponse.data.pagination.total || 0).toString();
        } else if (sentResponse.data?.profiles) {
          interestSentCount = sentResponse.data.profiles.length.toString();
        }
      } catch (e) {
        console.log('⚠️ Interest sent fetch error:', e);
        interestSentCount = '0';
      }
      
      // Get interest received count from interest-requests API
      let interestReceivedCount = '0';
      try {
        const receivedResponse = await apiService.getHeartRequests();
        console.log('📊 Interest received response:', receivedResponse);
        if (receivedResponse.status === 'success' && receivedResponse.data?.pagination) {
          interestReceivedCount = (receivedResponse.data.pagination.total || 0).toString();
        } else if (receivedResponse.data?.profiles) {
          interestReceivedCount = receivedResponse.data.profiles.length.toString();
        }
      } catch (e) {
        console.log('⚠️ Interest received fetch error:', e);
        interestReceivedCount = '0';
      }
      
      // Fetch new matches count using new endpoint
      let newMatchesCount = '0';
      try {
        const newMatchesResp = await apiService.getNewMatches({ limit: 1, page: 1 });
        console.log('📊 New matches response:', newMatchesResp);
        if (newMatchesResp.status === 'success') {
          const list = newMatchesResp.data?.profiles || newMatchesResp.data?.members || newMatchesResp.data?.data?.profiles || [];
          const total = newMatchesResp.data?.pagination?.total || list.length;
          newMatchesCount = total.toString();
        }
      } catch (e) {
        console.log('⚠️ New matches fetch error:', e);
        newMatchesCount = '0';
      }
      
      // Fetch shortlist count from shortlisted profiles API
      let shortlistCount = '0';
      try {
        const shortlistResponse = await apiService.getShortlistedHearts();
        console.log('📊 Shortlist response:', shortlistResponse);
        if (shortlistResponse.status === 'success' && shortlistResponse.data?.pagination) {
          shortlistCount = (shortlistResponse.data.pagination.total || 0).toString();
        } else if (shortlistResponse.data?.profiles) {
          shortlistCount = shortlistResponse.data.profiles.length.toString();
        }
      } catch (e) {
        console.log('⚠️ Shortlist fetch error:', e);
        shortlistCount = '0';
      }
      
      const updatedStats = [
        { 
          label: 'Interest Sent', 
          value: interestSentCount, 
          icon: 'send', 
          gradient: ['#10B981', '#059669'], 
          route: '/(tabs)/saved',
          tab: 'sent'
        },
        { 
          label: 'Interest Received', 
          value: interestReceivedCount, 
          icon: 'heart', 
          gradient: ['#EF4444', '#DC2626'], 
          route: '/(tabs)/saved',
          tab: 'received'
        },
        { 
          label: 'New Matches', 
          value: newMatchesCount, 
          icon: 'users', 
          gradient: ['#8B5CF6', '#7C3AED'], 
          route: '/(tabs)/profiles',
          tab: 'new'
        },
        { 
          label: 'Shortlist', 
          value: shortlistCount, 
          icon: 'bookmark', 
          gradient: ['#F59E0B', '#D97706'], 
          route: '/(tabs)/saved',
          tab: 'shortlist'
        },
      ];
      
      console.log('📊 Updated stats:', updatedStats);
      setStats(updatedStats);
      
    } catch (error: any) {
      console.error('❌ Error fetching stats:', error);
      // Keep loading state or show error values
      setStats([
        { label: 'Interest Sent', value: '0', icon: 'send', gradient: ['#10B981', '#059669'], route: '/(tabs)/saved', tab: 'sent' },
        { label: 'Interest Received', value: '0', icon: 'heart', gradient: ['#EF4444', '#DC2626'], route: '/(tabs)/saved', tab: 'received' },
        { label: 'New Matches', value: '0', icon: 'users', gradient: ['#8B5CF6', '#7C3AED'], route: '/(tabs)/profiles', tab: 'new' },
        { label: 'Shortlist', value: '0', icon: 'bookmark', gradient: ['#F59E0B', '#D97706'], route: '/(tabs)/saved', tab: 'shortlist' },
      ]);
    }
  };

  // Send interest to a profile
  const expressHeart = async (profileId: string | number) => {
    const freeUser = isFreeUser(auth?.user) || isFreeUser(auth?.limitation);
    if(freeUser){
      showPremiumModal();
      return;
    }
    try {
      const response = await apiService.expressHeart(profileId);
      if (response.status === 'success') {
        // Optimistically update limitation count in AuthContext
        if (auth?.limitation && auth?.updateLimitation) {
          const newCount = (auth.limitation.interest_express_limit ?? 0) - 1;
          auth.updateLimitation({ ...auth.limitation, interest_express_limit: newCount < 0 ? 0 : newCount });
        }
        // Refresh counts and UI immediately
        await Promise.all([
          fetchStats(), // update dashboard counters
          loadHeartedProfiles(),
          fetchProfiles(),
          (async () => {
            try {
              const dashboardResp = await apiService.getDashboard();
              if (dashboardResp?.data?.limitation && auth?.updateLimitation) {
                auth.updateLimitation(dashboardResp.data.limitation);
              }
            } catch (e) {
              console.log('⚠️ Failed to refresh limitation:', e);
            }
          })(),
        ]);
      }
    } catch (error) {
      console.error('Error sending interest:', error);
    }
  };

  // Load hearted profiles
  const loadHeartedProfiles = async () => {
    try {
      const resp = await apiService.getHeartedProfiles();
      if (resp.status === 'success') {
        const ids = new Set((resp.data?.profiles || resp.data || []).map((p: any) => p.id?.toString()).filter(Boolean));
        setInterestingProfiles(ids);
      }
    } catch (e) {}
  };

  // Fetch profiles (Recommended & New Matches)
  const fetchProfiles = async () => {
    try {
      const currentUserGender = (userInfo?.gender || userInfo?.basicInfo?.gender || loggedUser?.gender)?.toLowerCase();
      const oppositeGender = (loggedUser?.gender || '').toLowerCase() === 'male' ? 'female' : 'male';

      // Concurrent calls
      const [recommendedResp, newMatchesResp] = await Promise.all([
        apiService.getRecommendedMatches({ limit: 12, page: 1 }),
        apiService.getNewMatches({ limit: 12, page: 1 }),
      ]);

      // Debug: log raw API responses
      console.log('⭐ recommended API →', recommendedResp);
      console.log('🆕 new-matches API →', newMatchesResp);

      const sanitize = (list: any[], currentUser: any, oppositeGender?: string) => {
        let filtered = list;
        if (oppositeGender) {
          filtered = list.filter((p: any) => (p.gender || '').toLowerCase() === oppositeGender);
          if (filtered.length === 0) {
            // fallback to original list if filtering removed all profiles
            filtered = list;
          }
        }
        return filtered.slice(0, 5).map((profile: any) => {
          const genderLower = (String(profile.gender || profile.genderIdentity || '')).toLowerCase();
          let defaultImage;
          if (genderLower.startsWith('f')) {
            defaultImage = require('../../assets/images/female_avatar.webp');
          } else if (genderLower.startsWith('m')) {
            defaultImage = require('../../assets/images/male_avatar.webp');
          } else {
            // If gender missing, show opposite of logged-in user's gender for variety
            defaultImage = oppositeGender === 'female'
              ? require('../../assets/images/female_avatar.webp')
              : require('../../assets/images/male_avatar.webp');
          }

          // Determine city: prefer city / present_city / city_name / location
          // Determine if API returned a generic default image placeholder
          let profileImage:any = profile.image || profile.profileImage || profile.photo || null;
            if (profileImage && typeof profileImage === 'string') {
              // If path is relative (starts with / or lacks http), prefix with CDN domain
              const trimmed = profileImage.trim();
              if (!/^https?:\/\//i.test(trimmed)) {
                const baseCdn = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
                profileImage = `${baseCdn}/${trimmed.replace(/^\/+/, '')}`;
              }
            }
          if (profileImage && typeof profileImage === 'string' && !profileImage.startsWith('http')) {
            const base = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
            profileImage = `${base}/${profileImage}`;
          }

          const city = profile.city || profile.present_city || profile.city_name || profile.location || null;

          // Derive age in years if not provided
          const parsedDob = profile.dateOfBirth || profile.date_of_birth || profile.dob;
          const derivedAge = parsedDob ? calculateAge(parsedDob) : null;

          return {
            id: profile.id || profile.user_id,
            name: (profile.name || `${profile.firstname || ''} ${profile.lastname || ''}`.trim()).split(' ').slice(0,1).join(' '),
            fullName: profile.name || `${profile.firstname || ''} ${profile.lastname || ''}`.trim(),
            image: profileImage,
            profileImage,
            defaultImage,
            location: city || 'Location N/A',
            age: profile.age || derivedAge,
            gender: profile.gender,
            dateOfBirth: profile.dateOfBirth || profile.date_of_birth,
            dob: profile.dob || profile.date_of_birth,
          };
        });
      };

      const extractList = (resp: any) => {
        if (!resp || resp.status !== 'success') return [];
        const d = resp.data || {};
        // Possible structures
        return (
          d.profiles ||
          d.members ||
          d.users ||
          d.data?.profiles ||
          d.data?.members ||
          d.data?.users ||
          d.data?.data?.profiles ||
          d.data?.data?.members ||
          d.data?.data?.users ||
          []
        );
      };

      const recommendedList = sanitize(extractList(recommendedResp), loggedUser, oppositeGender);
      const newMatchesList = sanitize(extractList(newMatchesResp), loggedUser, oppositeGender);

      setNewlyJoinedProfiles(recommendedList); // Recommended section
      setNewMatchesProfiles(newMatchesList);   // New Matches section
    } catch (error) {
      console.error('❌ fetchProfiles error:', error);
      setNewlyJoinedProfiles([]);
      setNewMatchesProfiles([]);
    }
  };

  // Main useEffect to fetch data on mount
  // Initial data fetch
  useEffect(() => {
    fetchUserInfo();
    fetchStats();
    loadHeartedProfiles();
  }, [auth?.token, auth?.user]);

  // Fetch profiles once user information (gender) is available
  useEffect(() => {
    if (userInfo) {
      fetchProfiles();
    }
  }, [userInfo]);

  // Auto-refresh stats every 30 seconds when app is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth?.token) {
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [auth?.token, fetchStats]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserInfo(),
        fetchStats(),
        fetchProfiles()
      ]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    card: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#F8F9FA' },
  };

  // Helper function to get profile image URL with fallback
  const getProfileImageUrl = (image: string | undefined) => {
    if (!image) return 'https://via.placeholder.com/40';
    if (image.startsWith('http')) return image;
    
    // Try main server first, fallback to localhost
    const mainServerUrl = `https://90skalyanam.com/assets/images/user/profile/${image}`;
    const localUrl = `${process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile'}/${image}`;
    
    // Return main server URL (will fallback to local if main fails)
    return mainServerUrl;
  };

  return (
    <>
      <>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />
      <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#DC2626"
              title="Pull to refresh"
              titleColor={theme === 'dark' ? '#FFFFFF' : '#1A1A1A'}
            />
          }
        >
          {/* New Header Design - Exact UI Match */}
          <View style={[styles.newHeader, themeStyles.container]}>
            {/* Use UniversalHeader with profile picture instead of filter button */}
            <UniversalHeader 
              title={userInfo?.firstname || 'Home'}
              showProfileImage={true}
              userImage={userInfo?.image}
              onProfilePress={() => router.push('/account')}
              /* onMenuPress removed to disable popup */
              showFilter={false}
            />

          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}
          >
            <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search profiles..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>

        {/* Main Content - Card Container with Margin */}
        <View style={styles.cardContainerWrapper}>
          <LinearGradient
            colors={['#FCA5A5', '#F87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fullWidthBanner}
          >
            <View style={styles.bannerInnerContent}>
              {/* Left Side - Religion Image (User's Religion or Default Hindu) */}
              <View style={styles.bannerLeftContent}>
                <View style={styles.religionImageWrapper}>
                  <Animated.Image
                    source={rotationImages[bannerIndex]}
                    style={[styles.userReligionImage, { opacity: imageOpacity }]}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Right Side - Tagline Text */}
              <View style={styles.bannerRightContent}>
                <Text style={[styles.bannerTaglineText, {
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: '700',
                  color: 'white',
                  textAlign: 'center',
                  flexShrink: 1,
                  width: '100%',
                }, { fontSize: 12, paddingHorizontal: 8 }]} numberOfLines={3}>{taglineText}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Counters Section - Horizontal */}
        <View style={styles.countersSection}>
          {/* Interest Sent */}
          <LinearGradient colors={['#FCA5A5', '#F87171']} style={styles.counterGradient}>
            <TouchableOpacity
              style={styles.counterItem}
              onPress={() => router.push({ pathname: '/(tabs)/saved', params: { tab: 'sent' } })}
            >
              <Text style={styles.counterValue}>{stats[0]?.value || '0'}</Text>
              <Text style={styles.counterLabel}>{stats[0]?.label || 'Interest Sent'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Interest Received */}
          <LinearGradient colors={['#FCA5A5', '#F87171']} style={styles.counterGradient}>
            <TouchableOpacity
              style={styles.counterItem}
              onPress={() => router.push({ pathname: '/(tabs)/saved', params: { tab: 'received' } })}
            >
              <Text style={styles.counterValue}>{stats[1]?.value || '0'}</Text>
              <Text style={styles.counterLabel}>{stats[1]?.label || 'Interest Received'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Shortlist */}
          <LinearGradient colors={['#FCA5A5', '#F87171']} style={styles.counterGradient}>
            <TouchableOpacity
              style={styles.counterItem}
              onPress={() => router.push({ pathname: '/(tabs)/saved', params: { tab: 'shortlist' } })}
            >
              <Text style={styles.counterValue}>{stats[3]?.value || '0'}</Text>
              <Text style={styles.counterLabel}>{stats[3]?.label || 'Shortlist'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Main Content - Card Container with Margin */}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themeStyles.text]}>Recommended</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profiles', params: { initialTab: 'Recommended' } })}><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={newlyJoinedProfiles}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <MiniProfileCard
              item={item}
              onPress={() => router.push(`/profile/${item.id}`)}
              onHeartPress={() => expressHeart(item.id)}
              interestingProfiles={interestingProfiles}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themeStyles.text]}>New Matches</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profiles', params: { initialTab: 'New Matches' } })}><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={newMatchesProfiles}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <ProfileCard
              item={item}
              onPress={() => router.push(`/profile/${item.id}`)}
              onHeartPress={() => expressHeart(item.id)}
              interestingProfiles={interestingProfiles}
              isHorizontal={true}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />
        
        </ScrollView>
      </View>

      {/* Features Modal - 4 Circles with Grouped Background */}
      {featuresModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setFeaturesModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.featuresModal}>
            {/* Grouped Container with Circular Background */}
            <View style={styles.groupedCirclesContainer}>
              {/* Circle 1: Complete Profile */}
              <TouchableOpacity 
                style={styles.featureCircle}
                onPress={() => {
                  setFeaturesModalVisible(false);
                  try {
                    router.push('/(auth)/profile-completion');
                  } catch (e) {
                    router.push('/account');
                  }
                }}
              >
                <View style={[styles.circleInner, { backgroundColor: '#3B82F6' }]}>
                  <Feather name="user-check" size={28} color="white" />
                </View>
                <Text style={styles.circleLabel}>Complete{'\n'}Profile</Text>
              </TouchableOpacity>

              {/* Circle 2: My Tickets */}
              <TouchableOpacity 
                style={styles.featureCircle}
                onPress={() => {
                  setFeaturesModalVisible(false);
                  try {
                    router.push('/support-tickets');
                  } catch (e) {
                    Alert.alert('Coming Soon', 'Support tickets feature will be available soon');
                  }
                }}
              >
                <View style={[styles.circleInner, { backgroundColor: '#8B5CF6' }]}>
                  <Feather name="ticket" size={28} color="white" />
                </View>
                <Text style={styles.circleLabel}>My{'\n'}Tickets</Text>
              </TouchableOpacity>

              {/* Circle 3: AI Match */}
              <TouchableOpacity 
                style={styles.featureCircle}
                onPress={() => {
                  setFeaturesModalVisible(false);
                  try {
                    router.push('/ai-match');
                  } catch (e) {
                    router.push('/(tabs)/profiles');
                  }
                }}
              >
                <View style={[styles.circleInner, { backgroundColor: '#EC4899' }]}>
                  <Feather name="zap" size={28} color="white" />
                </View>
                <Text style={styles.circleLabel}>AI{'\n'}Match</Text>
              </TouchableOpacity>

              {/* Circle 4: My Matches */}
              <TouchableOpacity 
                style={styles.featureCircle}
                onPress={() => {
                  setFeaturesModalVisible(false);
                  router.push('/(tabs)/profiles');
                }}
              >
                <View style={[styles.circleInner, { backgroundColor: '#10B981' }]}>
                  <Feather name="heart" size={28} color="white" />
                </View>
                <Text style={styles.circleLabel}>My{'\n'}Matches</Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFeaturesModalVisible(false)}
            >
              <Feather name="x" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu Modal */}
      <MenuModal 
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />
    </>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomLine: { height: 1, backgroundColor: '#DC2626', marginTop: 0 },
  
  // New Header Design
  newHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  menuDotsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fourDotsMenu: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  menuIconsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countersSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  counterGradient: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  counterItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#DC2626',
    lineHeight: 36,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 16,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerUserNameCenter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileIconButtonPink: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    gap: 2,
  },
  headerLocationLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  headerLocation: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  profileIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  
  // Card Container Wrapper with Margin
  cardContainerWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginTop: 40,
    borderRadius: 20,
    overflow: 'visible',
  },
  
  // Full Width Banner - Compact with Image Overflow
  fullWidthBanner: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 20,
    minHeight: 100,
    overflow: 'visible',
  },
  bannerInnerContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 100,
  },
  bannerLeftContent: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 0,
    overflow: 'visible',
  },
  religionImageWrapper: {
    width: 140,
    height: 170,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'visible',
  },
  userReligionImage: {
    width: 140,
    height: 140,
  },
  userNameText: {
    display: 'none',
  },
  bannerRightContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  bannerTaglineText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    flexShrink: 1,
    width: '100%',
  },
  suggestedEmoji: {
    fontSize: 20,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
  suggestedSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  highlightsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  highlightEmoji: {
    fontSize: 14,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  optionsContainer: {
    gap: 10,
  },
  optionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  
  // Features Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  featuresModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  groupedCirclesContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 3,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  featureCircle: {
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  circleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  circleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    maxWidth: 90,
    lineHeight: 14,
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  // Section Headers
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginTop: 12, 
    marginBottom: 8 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  viewAll: { 
    color: '#DC2626', 
    fontWeight: '600' 
  },
  
  // Just Joined Cards
  justJoinedCard: { 
    marginRight: 15, 
    alignItems: 'center',
  },
  justJoinedImageContainer: { 
    position: 'relative', 
    width: 160, 
    height: 200, 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DC2626',
    elevation: 5,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  justJoinedImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 14,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownBadgeIndex: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  justJoinedGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  justJoinedContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  justJoinedName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  justJoinedDetails: {
    gap: 2,
  },
  justJoinedAge: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '600',
  },
  justJoinedLocation: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  justJoinedHeartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  
  // New Matches Cards
  newMatchCard: { 
    marginRight: 20, 
    alignItems: 'center',
    width: 100,
  },
  newMatchImageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  newMatchImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  newMatchImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMatchAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  newMatchInfo: {
    alignItems: 'center',
    width: '100%',
  },
  newMatchName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  newMatchAge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  newMatchLocation: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
  newMatchHeartButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  
  profileName: { 
    marginTop: 8, 
    fontWeight: 'bold' 
  },
  profileLocation: { 
    fontSize: 12 
  },
});