import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, RefreshControl, Image, StatusBar, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import ProfileImage from '../../components/ProfileImage';
import HeartIcon from '../../components/HeartIcon';
import UniversalHeader from '../../components/UniversalHeader';
import MenuModal from '../../components/MenuModal';
//import WithSwipe from '../../components/WithSwipe';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremiumModal } from '../../context/PremiumModalContext';
import styles from '../styles/savedscreenStyles';

export default function InterestedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const auth = useAuth();
  const { showPremiumModal } = usePremiumModal();
  // Build absolute URL for current user's profile image
  const userProfileImg = (() => {
    const img = auth?.user?.image;
    if (!img) return undefined;
    if (typeof img === 'string' && img.startsWith('http')) return img;
    return `https://app.90skalyanam.com/assets/images/user/profile/${img}`;
  })();
  // Determine current user gender (lowercase), default to 'male' if unknown
  const currentUserGender = (auth?.user?.gender || (auth?.user as any)?.basic_info?.gender || (auth?.user as any)?.basicInfo?.gender || 'male')?.toLowerCase();
  
  const hasFreePackage = (): boolean => {
    const pkgIdUser = auth?.user?.package_id ?? auth?.user?.packageId;
    return pkgIdUser === 4;
  };
  const [activeTab, setActiveTab] = useState(params.tab as string || 'sent');
  const [sentProfiles, setSentProfiles] = useState([]);
  const [receivedProfiles, setReceivedProfiles] = useState([]);
  const [ignoredProfiles, setIgnoredProfiles] = useState([]);
  const [shortlistedProfiles, setShortlistedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  // Helper to compute age from various date fields
  const computeAge = (obj: any): number | null => {
    const dobStr = obj.dob || obj.date_of_birth || obj.birthDate || obj.birth_date;
    if (!dobStr) return null;
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  useEffect(() => {
    console.log('🎯 Interest Screen Mounted - Starting data fetch');
    fetchAllInterests();
  }, []);

  const fetchAllInterests = async () => {
    try {
      setLoading(true);
      console.log('🚀 ===== FETCHING ALL INTEREST DATA =====');
      console.log('⏰ Timestamp:', new Date().toISOString());
      
      // Fetch sent interests (profiles I'm interested in)
      console.log('\n📤 FETCHING SENT INTERESTS...');
      console.log('🔗 Calling apiService.getHeartedProfiles()');
      const sentResponse = await apiService.getHeartedProfiles();
      console.log('📥 Sent interests API response:', sentResponse);
      console.log('📥 Sent interests API response status:', sentResponse?.status);
      console.log('📥 Sent interests full response:', JSON.stringify(sentResponse, null, 2));
      console.log('📥 Response keys:', Object.keys(sentResponse || {}));
      
      if (sentResponse.status === 'success') {
        const sentProfiles = sentResponse.data?.profiles || sentResponse.data || [];
        console.log('✅ Sent profiles count:', sentProfiles.length);
        console.log('📋 Sent profiles raw array:', JSON.stringify(sentProfiles, null, 2));
        
        const transformedSent = sentProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing sent profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    Status: ${profile.status}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);
          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          // Status mapping
          const status = profile.status === 1 || profile.status === 'accepted' ? 'Accepted' : 'Pending';
          
          const transformed = {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            gender: (profile.gender || profile.basicInfo?.gender || '').toString(),
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: status,
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'sent',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
          console.log(`    ✅ Transformed: ${JSON.stringify(transformed)}`);
          return transformed;
        });
        setSentProfiles(transformedSent);
        console.log(`\n✅ Sent interests loaded: ${transformedSent.length} profiles`);
        console.log('📊 Transformed sent profiles:', JSON.stringify(transformedSent, null, 2));
      } else {
        console.log('❌ Sent interests API error:', sentResponse.message);
      }

      // Fetch received interests (profiles interested in me)
      console.log('\n📥 FETCHING RECEIVED INTERESTS...');
      const receivedResponse = await apiService.getHeartRequests();
      console.log('📥 Received interests API response status:', receivedResponse.status);
      console.log('📥 Received interests full response:', JSON.stringify(receivedResponse, null, 2));
      
      if (receivedResponse.status === 'success') {
        const receivedProfiles = receivedResponse.data?.profiles || receivedResponse.data || [];
        console.log('✅ Received profiles count:', receivedProfiles.length);
        console.log('📋 Received profiles raw array:', JSON.stringify(receivedProfiles, null, 2));
        
        const transformedReceived = receivedProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing received profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    Status: ${profile.status}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);

          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          // Status mapping
          const status = profile.status === 1 || profile.status === 'accepted' ? 'Accepted' : 'Pending';
          
          return {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            gender: (profile.gender || profile.basicInfo?.gender || '').toString(),
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: status,
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'received',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
        });
        setReceivedProfiles(transformedReceived);
        console.log('✅ Received interests loaded:', transformedReceived.length);
        console.log('📋 Transformed received profiles:', transformedReceived);
      }

      // Fetch ignored profiles
      console.log('\n🚫 FETCHING IGNORED PROFILES...');
      const ignoredResponse = await apiService.getIgnoredHearts();
      console.log('📥 Ignored profiles API response status:', ignoredResponse.status);
      console.log('📥 Ignored profiles full response:', JSON.stringify(ignoredResponse, null, 2));
      
      if (ignoredResponse.status === 'success') {
        const ignoredProfiles = ignoredResponse.data?.profiles || ignoredResponse.data || [];
        console.log('✅ Ignored profiles count:', ignoredProfiles.length);
        console.log('📋 Ignored profiles raw array:', JSON.stringify(ignoredProfiles, null, 2));
        
        const transformedIgnored = ignoredProfiles.map((profile: any, index: number) => {
          console.log(`\n  🔄 Processing ignored profile #${index + 1}:`);
          console.log(`    ID: ${profile.id}`);
          console.log(`    Name: ${profile.name}`);
          console.log(`    Age: ${profile.age}`);
          console.log(`    Location: ${profile.location}`);
          console.log(`    Image: ${profile.profileImage}`);
          console.log(`    Height: ${profile.height}`);
          console.log(`    Religion: ${profile.religion}`);
          console.log(`    Caste: ${profile.caste}`);
          console.log(`    Interest Date: ${profile.interestDate}`);
          console.log(`    KYC Verified: ${profile.kycVerified}`);
          console.log(`    All Keys: ${Object.keys(profile).join(', ')}`);
          
          // Age is already calculated by backend
          const age = profile.age || computeAge(profile) || 'N/A';
          
          // Image URL is already formatted by backend
          const imageUrl = profile.profileImage || null;
          
          // Format interest date
          let interestDate = 'Recently';
          if (profile.interestDate) {
            interestDate = new Date(profile.interestDate).toLocaleDateString();
          } else if (profile.interested_at) {
            interestDate = new Date(profile.interested_at).toLocaleDateString();
          }
          
          const transformed = {
            id: profile.id,
            name: profile.name || 'User',
            age: age,
            gender: (profile.gender || profile.basicInfo?.gender || '').toString(),
            location: profile.location || 'N/A',
            profileImage: imageUrl,
            interestDate: interestDate,
            status: 'Ignored',
            isVerified: profile.kycVerified || false,
            isPremium: profile.premium || false,
            type: 'ignored',
            height: profile.height || 'N/A',
            religion: profile.religion || 'N/A',
            caste: profile.caste || 'N/A',
          };
          console.log(`    ✅ Transformed: ${JSON.stringify(transformed)}`);
          return transformed;
        });
        setIgnoredProfiles(transformedIgnored);
        console.log(`\n✅ Ignored interests loaded: ${transformedIgnored.length} profiles`);
        console.log('📊 Transformed ignored profiles:', JSON.stringify(transformedIgnored, null, 2));
      } else {
        console.log('❌ Ignored profiles API error:', ignoredResponse.message);
      }

      // ================= Shortlisted profiles =================
      console.log('\n📌 FETCHING SHORTLISTED PROFILES...');
      const shortlistResponse = await apiService.getShortlistedProfiles();
      if (shortlistResponse.status === 'success') {
        const shortlist = shortlistResponse.data?.profiles || [];
        setShortlistedProfiles(shortlist);
        console.log('✅ Shortlisted profiles count:', shortlist.length);
      }

      // Final Summary
      console.log('\n📊 ===== FINAL SUMMARY =====');
      console.log(`✅ Sent profiles: ${sentProfiles.length}`);
      console.log(`✅ Received profiles: ${receivedProfiles.length}`);
      console.log(`✅ Ignored profiles: ${ignoredProfiles.length}`);
      console.log('🎉 ===== DATA FETCH COMPLETE =====\n');

    } catch (error: any) {
      console.error('💥 ===== ERROR FETCHING INTEREST DATA =====');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error response:', error?.response);
      console.error('📋 Error details:', JSON.stringify(error, null, 2));
      console.error('📋 Error stack:', error?.stack);
      setSentProfiles([]);
      setReceivedProfiles([]);
      setIgnoredProfiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('✅ fetchAllInterests completed');
    }
  };

  const handleRemoveInterest = async (profileId: string | number) => {
    Alert.alert(
      'Remove Interest',
      'Are you sure you want to remove your interest in this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.removeInterest(profileId.toString());
              if (response.status === 'success') {
                // Remove from sent profiles (only sent interests can be removed)
                setSentProfiles((prev: any) => prev.filter((p: any) => p.id !== profileId));
                console.log('✅ Interest removed successfully');
              }
            } catch (error) {
              console.error('💥 Error removing interest:', error);
              Alert.alert('Error', 'Failed to remove interest. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleIgnoreInterest = async (profileId: string | number) => {
    try {
      // Call API to ignore profile
      const response = await apiService.ignoreHeart(profileId);
      
      if (response.status === 'success') {
        // Find the profile to move to ignored list
        const profileToIgnore = receivedProfiles.find((p: any) => p.id === profileId);
        
        if (profileToIgnore) {
          // Add to ignored list
          setIgnoredProfiles((prev: any) => [...prev, { ...profileToIgnore, status: 'Ignored' }]);
          
          // Remove from received profiles
          setReceivedProfiles((prev: any) => prev.filter((p: any) => p.id !== profileId));
          
          console.log('✅ Profile ignored successfully');
          Alert.alert('Success', 'Profile has been added to your ignore list');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to ignore profile. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error ignoring profile:', error);
      Alert.alert('Error', 'Failed to ignore profile. Please try again.');
    }
  };

  const handleAcceptInterest = async (profileId: string | number) => {
    // Block if user is on free package (id 4)
    if (hasFreePackage()) {
      showPremiumModal();
      return;
    }
    try {
      // Call API to accept interest
      const response = await apiService.acceptHeart(profileId);
      
      if (response.status === 'success') {
        // Update status to accepted
        setReceivedProfiles((prev: any) => prev.filter((p: any) => p.id !== profileId));
        
        console.log('✅ Interest accepted successfully');
        // Add to shortlist tab as accepted
        setShortlistedProfiles((prev:any)=>[...prev,{...response.data, id: profileId, status: 'Accepted'}]);
        Alert.alert('Success', 'Both are interested!');
      } else {
        Alert.alert('Error', response.message || 'Failed to accept interest. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error accepting interest:', error);
      Alert.alert('Error', 'Failed to accept interest. Please try again.');
    }
  };

  const handleShortlist = async (profileId: string | number) => {
    try {
      const resp = await apiService.toggleShortlist(profileId);
      if (resp.status === 'success') {
        const latest = await apiService.getShortlistedProfiles();
        if (latest.status === 'success') {
          setShortlistedProfiles(latest.data?.profiles || []);
        }
        Alert.alert('Success', 'Shortlist updated');
      } else {
        Alert.alert('Error', resp.message || 'Failed to update shortlist');
      }
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      Alert.alert('Error', 'Failed to shortlist profile. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllInterests();
  };

  const getCurrentProfiles = () => {
    if (activeTab === 'sent') return sentProfiles;
    if (activeTab === 'received') return receivedProfiles;
    if (activeTab === 'ignored') return ignoredProfiles;
    if (activeTab === 'shortlist') return shortlistedProfiles;
    return [];
  };

  const renderTabBar = () => {
    const tabs = [
      { label: `Sent (${sentProfiles.length})`, key: 'sent' },
      { label: `Received (${receivedProfiles.length})`, key: 'received' },
      { label: `Ignored (${ignoredProfiles.length})`, key: 'ignored' },
      { label: `Shortlist (${shortlistedProfiles.length})`, key: 'shortlist' }
    ];
    
    console.log('📑 Rendering tabs with counts:', {
      sent: sentProfiles.length,
      received: receivedProfiles.length,
      ignored: ignoredProfiles.length,
      shortlist: shortlistedProfiles.length,
      activeTab: activeTab
    });
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.filterTabsContainer, theme === 'dark' && styles.filterTabsContainerDark]}
        contentContainerStyle={styles.filterTabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              theme === 'dark' && styles.filterTabDark,
              activeTab === tab.key && styles.filterTabActive
            ]}
            onPress={() => {
              console.log(`📑 Tab switched to: ${tab.key}`);
              setActiveTab(tab.key);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                theme === 'dark' && styles.filterTabTextDark,
                activeTab === tab.key && styles.filterTabTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Helper to resolve default avatar
  const getDefaultAvatar = (gender?: string) => {
    const g = (gender || '').toLowerCase();
    if (g === 'female') {
      return require('../../assets/images/female_avatar.webp');
    }
    if (g === 'male') {
      return require('../../assets/images/male_avatar.webp');
    }
    // If gender unknown, show opposite of current user's gender
    return currentUserGender === 'male'
      ? require('../../assets/images/female_avatar.webp')
      : require('../../assets/images/male_avatar.webp');
  };

  const renderProfile = ({ item }: { item: any }) => {
    console.log(`🎨 Rendering profile card for: ${item.name} (ID: ${item.id})`);
    return (
      <View style={styles.profileCardContainer}>
        {/* Main Card with Image and Gradient Overlay */}
        <View style={styles.mainCard}>
          {/* Image Container with Gradient */}
          <View style={styles.imageCardContainer}>
            <LinearGradient
              colors={['#DC2626', '#EF4444', '#F87171']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageCard}
            >
              <Image
                source={item.profileImage ? { uri: item.profileImage } : getDefaultAvatar(item.gender)}
                style={styles.profileImage}
                resizeMode="cover"
              />
              
              {/* Profile Info Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                style={styles.infoOverlay}
              >
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{item.name}</Text>
                  <Text style={styles.profileDetails}>{item.age} yrs • {item.location}</Text>
                </View>
              </LinearGradient>

              {/* Verified Badge */}
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check-circle" size={18} color="white" />
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Action Buttons - Bottom of Card */}
          <View style={styles.cardActionButtons}>
            {/* Left Button */}
            {activeTab === 'sent' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.removeActionButton]}
                onPress={() => {
                  // Block if user is on free package (id 4)
                  if (hasFreePackage()) {
                    showPremiumModal();
                    return;
                  }
                  router.push({
                    pathname: `/chat/${item.id}`,
                    params: {
                      image: item.profileImage,
                      name: item.name,
                      userId: item.id,
                      gender: item.gender
                    }
                  });
                }}
              >
                <Feather name="message-circle" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            {activeTab === 'received' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.acceptActionButton]}
                onPress={() => handleAcceptInterest(item.id)}
                disabled={item.status === 'Accepted'}
              >
                <Feather name="check" size={20} color="white" />
              </TouchableOpacity>
            )}

            {activeTab === 'ignored' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.shortlistActionButton]}
                onPress={() => handleShortlist(item.id)}
              >
                <Feather name="bookmark" size={20} color="white" />
              </TouchableOpacity>
            )}

            {/* Center Button - View Profile */}
            <TouchableOpacity 
              style={[styles.cardActionButton, styles.cardActionButtonLarge, styles.viewProfileButton]}
              onPress={() => router.push(`/profile/${item.id}`)}
            >
              <Feather name="eye" size={28} color="white" />
            </TouchableOpacity>

            {/* Right Button */}
                        

            {activeTab === 'ignored' && (
              <TouchableOpacity 
                style={[styles.cardActionButton, styles.cardActionButtonSmall, styles.acceptActionButton]}
                onPress={() => handleShortlist(item.id)}
              >
                <Feather name="check" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Section Below Card */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height:</Text>
            <Text style={styles.infoValue}>{item.height}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Religion:</Text>
            <Text style={styles.infoValue}>{item.religion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Caste:</Text>
            <Text style={styles.infoValue}>{item.caste}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Date:</Text>
            <Text style={styles.infoValue}>{item.interestDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: item.status === 'Accepted' ? '#059669' : '#D97706' }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F9F9F9' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    headerBg: theme === 'dark' ? { backgroundColor: '#2A2A2A' } : { backgroundColor: '#FFFFFF' },
  };

  if (loading) {
    return (
      //<WithSwipe toLeft="/(tabs)/profiles" toRight="/(tabs)/chats">
      <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
        <StatusBar 
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
          translucent={false}
        />
        <UniversalHeader 
          title="Interest"
          showProfileImage={true}
          userImage={userProfileImg}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
          leftIcon="heart"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={[styles.loadingText, themeStyles.secondaryText]}>Loading interests...</Text>
        </View>
      </View>
    );
  }

  const currentProfiles = getCurrentProfiles();

  // Empty state UI meta (computed without hooks)
  const emptyStateData = (() => {
    switch (activeTab) {
      case 'sent':
        return {
          icon: 'send',
          title: 'No Hearts Sent',
          description: "You haven't expressed heart in any profiles yet. Start exploring and find your perfect match!",
        };
      case 'received':
        return {
          icon: 'heart',
          title: 'No Hearts Received',
          description: "No one has expressed heart in your profile yet. Keep your profile updated and active!",
        };
      case 'ignored':
        return {
          icon: 'x-circle',
          title: 'No Ignored Profiles',
          description: "You haven't ignored any profiles yet.",
        };
      case 'shortlist':
        return {
          icon: 'bookmark',
          title: 'No Shortlisted Profiles',
          description: "You haven't shortlisted any profiles yet.",
        };
      default:
        return {
          icon: 'heart',
          title: 'No Data',
          description: 'No results to show.',
        };
    }
  })();

  return (
    //<WithSwipe toLeft="/(tabs)/profiles" toRight="/(tabs)/chats">
    <View style={[styles.container, themeStyles.container, { flex: 1 }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
        translucent={false}
      />
      
      {/* Header with Tabs Below */}
      <View style={[styles.headerWithTabs, themeStyles.container]}>
        <UniversalHeader 
          title="Interest"
          showProfileImage={true}
          userImage={userProfileImg}
          onProfilePress={() => router.push('/account')}
          onMenuPress={() => setMenuModalVisible(true)}
          leftIcon="heart"
        />
        
        {/* Filter Tabs - Below Header */}
        {renderTabBar()}
      </View>

      {/* Premium Upgrade Banner - Only show for non-premium users */}
      {hasFreePackage() && (
        <LinearGradient
          colors={['#D4AF37',"#FFD700", '#B8860B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumBannerContent}>
            <View style={styles.premiumBannerText}>
              <Feather name="lock" size={18} color="white" />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumBannerTitle}>View Full Profiles</Text>
                <Text style={styles.premiumBannerSubtitle}>Upgrade to Premium to see all details</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.premiumBannerButton}
              onPress={() => router.push('/plans') }
            >
              <Text style={styles.premiumBannerButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
      
      {currentProfiles.length > 0 ? (
        <FlatList
          data={currentProfiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.tint]}
              tintColor={Colors.light.tint}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      ) : (
                <View style={styles.emptyContainer}>
          <Feather 
            name={emptyStateData.icon} 
            size={64} 
            color={theme === 'dark' ? Colors.dark.icon : Colors.light.icon} 
          />
          <Text style={[styles.emptyTitle, theme === 'dark' && { color: '#FFFFFF' }]}>
            {emptyStateData.title}
          </Text>
          <Text style={[styles.emptyText, theme === 'dark' && { color: Colors.dark.icon }]}>
            {emptyStateData.description}
          </Text>
          <TouchableOpacity 
            style={styles.browseButton} 
            onPress={() => router.push('/(tabs)/profiles')}
          >
            <Text style={styles.browseButtonText}>Browse Profiles</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Modal */}
      <MenuModal 
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
      />
    </View>
  );
};