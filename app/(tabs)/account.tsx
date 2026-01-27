import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ColorValue, SafeAreaView, StatusBar, Modal, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/accountStyles';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
// Razorpay inline code removed; payment handled via dedicated screen

type IconName = ComponentProps<typeof Feather>['name'];
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ProfileCard, { ProfileCardRef } from '../../components/ProfileCard';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';
import UniversalHeader from '../../components/UniversalHeader';

// Custom Image component with fallback support
const FallbackImage = ({ 
  source, 
  style, 
  fallbackSource,
  ...props 
}: { 
  source: { uri: string }; 
  style: any; 
  fallbackSource?: { uri: string };
  [key: string]: any;
}) => {
  const [imageSource, setImageSource] = useState(source);
  const [error, setError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback && fallbackSource) {
      setTriedFallback(true);
      setImageSource(fallbackSource);
    } else {
      setError(true);
    }
  };

  return (
    <Image
      source={imageSource}
      style={style}
      onError={handleError}
      onLoad={() => {}}
      {...props}
    />
  );
};

const quickActionItems: { id: string; title: string; icon: IconName; color: string; bgColor: string }[] = [
  { id: '2', title: 'Complete Profile', icon: 'check-circle', color: '#8B5CF6', bgColor: '#EDE9FE' },
];

// Crown color helpers
const getCrownColor = (packageName: string | undefined) => {
  switch ((packageName || '').toUpperCase()) {
    case 'PREMIUM':
    case 'GOLD':
      return '#FFD700'; // gold
    case 'SILVER':
      return '#C0C0C0';
    case 'PLATINUM':
      return '#E5E4E2';
    case 'PRO':
      return '#8B5CF6'; // purple
    default:
      return '#6B7280'; // gray
  }
};

const menuItems: { id: string; title: string; icon: IconName }[] = [
  { id: '1', title: 'Plans & Pricing', icon: 'credit-card' },
  { id: '2', title: 'Purchase History', icon: 'settings' },
  { id: '3', title: 'Ignored Lists', icon: 'slash' },
];

// Helper function to construct image URL with fallback
// Primary: Local IP server, Fallback: 90skalyanam.com
const getImageUrl = (image: string | null | undefined): { primary: string | null; fallback: string | null } => {
  // Treat empty or generic placeholder images as no image
  if (!image || typeof image !== 'string' || image.trim() === '' || /default|placeholder|no[-_]image/i.test(image)) {
    return { primary: null, fallback: null };
  }
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  const trimmedImage = image.trim();
  
  // If already a full URL, use it as primary with production as fallback
  if (trimmedImage.startsWith('http')) {
    // Extract just the filename for fallback
    const filename = trimmedImage.split('/').pop() || trimmedImage;
    const fallbackUrl = `https://90skalyanam.com/assets/images/user/profile/${filename}`;
    return { primary: trimmedImage, fallback: fallbackUrl };
  }
  
  // Primary URL from environment variable (Local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/profile';
  const primaryUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  // Fallback URL from production server (90skalyanam.com)
  const fallbackUrl = `https://90skalyanam.com/assets/images/user/profile/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

// Helper function to construct gallery image URL with fallback
// Primary: Local IP server, Fallback: 90skalyanam.com
const getGalleryImageUrl = (image: string | null | undefined): { primary: string | null; fallback: string | null } => {
  if (!image || typeof image !== 'string' || image.trim() === '' || /default|placeholder|no[-_]image/i.test(image)) {
    return { primary: null, fallback: null };
  }
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  const trimmedImage = image.trim();
  
  // If already a full URL, use it as primary with production as fallback
  if (trimmedImage.startsWith('http')) {
    const filename = trimmedImage.split('/').pop() || trimmedImage;
    const fallbackUrl = `https://90skalyanam.com/assets/images/user/gallery/${filename}`;
    return { primary: trimmedImage, fallback: fallbackUrl };
  }
  
  // Primary URL from environment variable (Local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || 'http://10.97.175.139:8000/assets/images/user/gallery';
  const primaryUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  // Fallback URL from production server (90skalyanam.com)
  const fallbackUrl = `https://90skalyanam.com/assets/images/user/gallery/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

export default function AccountScreen() {
  const { user } = useAuth();

  const handlePayNow = (planId:number) => {
    router.push({ pathname: '/payment', params: { planId: planId.toString() } });
  };
  const router = useRouter();
  const profileCardRef = useRef<ProfileCardRef>(null);
  const auth = useAuth();
  const { theme, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const limitation = auth?.limitation;
  const logout = auth?.logout;
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  // Determine default image based on gender after userProfile is available
  const defaultProfileImg = React.useMemo(() => {
    const g = (userProfile?.gender || user?.gender || '').toString().trim().toLowerCase();
    const isFemale = g === 'female' || g === 'f';
    return isFemale
      ? require('../../assets/images/female_avatar.webp')
      : require('../../assets/images/male_avatar.webp');
  }, [userProfile?.gender, user?.gender]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'actions'>('photos');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
    // Resolve profile image URL regardless of object or string shape
  const profileImageUrl = (() => {
    if (!userProfile?.image) return null;
    if (typeof userProfile.image === 'string') return userProfile.image;
    if (typeof userProfile.image === 'object' && userProfile.image.primary) return userProfile.image.primary;
    return null;
  })();

  const isValidProfileImage = !!profileImageUrl && !/default|placeholder|no[-_]image/i.test(profileImageUrl);
  // Remaining uploads based on gallery images count (UI authoritative)
  const MAX_GALLERY_IMAGES = 4;
  // Prepare images for ImageViewing component
  const viewerImages = galleryImages.filter(g=>g && g.image).map(g=>({ uri: g.image }));
  // Helper to download image to device
  const downloadImage = async (url: string) => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant permission to save photos.');
        return;
      }
      const filename = url.split('/').pop() ?? `img_${Date.now()}.jpg`;
      const destPath = FileSystem.cacheDirectory + filename;

      const { status } = await FileSystem.downloadAsync(url, destPath);
      if (status !== 200) {
        Alert.alert('Download failed', 'Server returned an error');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(destPath);
      Alert.alert('Saved', 'Photo downloaded to gallery');
    } catch (err) {
      Alert.alert('Error', 'Failed to download image');
    }
  };
  const remainingUploads = Math.max(0, MAX_GALLERY_IMAGES - galleryImages.length);

  const handleThemeToggle = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      await setThemeMode(newTheme);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchGalleryImages();
  }, []);

  // Update dashboard counts when limitation changes (e.g., after expressing interest)
  useEffect(() => {
    if (limitation) {
      setDashboardData(prev => ({
        ...prev,
        remaining_interests: limitation.interest_express_limit ?? prev?.remaining_interests,
        remaining_contact_view: limitation.contact_view_limit ?? prev?.remaining_contact_view,
        // keep original dashboardData update (no change)
      }));
    }
  }, [limitation]);

  const fetchDashboardData = async () => {
      let apiProfileLoaded = false;
    try {
      setLoading(true);
      
      console.log('📊 Account Screen - Fetching Dashboard Data');
      console.log('👤 User:', user?.id, user?.firstname);
      console.log('📋 Limitation from AuthContext:', limitation);
      
      // 1. Fetch detailed profile from /user/details to get latest stats
      try {
        const detailsResp = await apiService.getUserDetails();
        if(detailsResp.status==='success' && detailsResp.data?.profile){
          const prof = detailsResp.data.profile;
          console.log('📄 User details:', prof);
          // Map image url
          const imgUrl = getImageUrl(prof.image);
          // derive premium
          const isPrem = prof.plan_name && !['FREE MATCH','BASIC MATCH'].includes(prof.plan_name.toUpperCase());
          // stats
          const stats = prof.stats || {};
          setDashboardData({
            remaining_contact_view: stats.contact_view ?? 0,
            remaining_interests: stats.interest_left ?? 0,
            remaining_image_upload: Math.max(0, MAX_GALLERY_IMAGES - (stats.gallery_upload_used ?? 0)),
          });
          setUserProfile({
            firstname: prof.firstname,
            lastname: prof.lastname,
            profile_id: prof.profile_id,
            image: imgUrl,
            id: prof.id,
            packageId: prof.plan_name,
            packageName: prof.plan_name,
            premium: isPrem ? 1 : 0,
            gender: prof.gender
          });
          apiProfileLoaded = true;
          // gallery list
          if(Array.isArray(prof.gallery)){
            setGalleryImages(prof.gallery.map((g:any)=>({image:g.url})));
          }
        }
      }catch(e){console.log('⚠️ user/details fetch failed',e);} 

      // Fallback: use AuthContext info if needed
      // First try to use user data from auth context
      if (!apiProfileLoaded && user && user.id) {
        const imageUrl = getImageUrl(user.image);
        
        // Get package info from limitation data
        const packageId = limitation?.package_id || user.package_id || 1;
        const packageName = user.package_name || 'FREE MATCH';
        
        // Use limitation data from AuthContext (from login response)
        let remainingInterests = 0;
        let remainingContactView = 0;
        let remainingImageUpload = 0;
        
        if (limitation) {
          console.log('✅ Limitation data found');
          console.log('  - interest_express_limit:', limitation.interest_express_limit);
          console.log('  - contact_view_limit:', limitation.contact_view_limit);
          console.log('  - image_upload_limit:', limitation.image_upload_limit);
          
          // Use the actual limitation counts from login response
          remainingInterests = limitation.interest_express_limit !== undefined ? limitation.interest_express_limit : 0;
          remainingContactView = limitation.contact_view_limit !== undefined ? limitation.contact_view_limit : 0;
          remainingImageUpload = limitation.image_upload_limit !== undefined ? limitation.image_upload_limit : 0;
          
          // Handle unlimited (-1 means unlimited)
          if (remainingInterests === -1) remainingInterests = 'Unlimited';
          if (remainingContactView === -1) remainingContactView = 'Unlimited';
          if (remainingImageUpload === -1) remainingImageUpload = 'Unlimited';
          
          console.log('📊 Processed values:');
          console.log('  - remainingInterests:', remainingInterests);
          console.log('  - remainingContactView:', remainingContactView);
          console.log('  - remainingImageUpload:', remainingImageUpload);
        } else {
          console.log('⚠️ No limitation data in AuthContext');
        }
        
        // Set dashboard data with limitation counts
        setDashboardData({
          remaining_contact_view: remainingContactView,
          remaining_interests: remainingInterests,
          remaining_image_upload: remainingImageUpload,
        });
        
        // Set user profile data from auth context
        setUserProfile({
          firstname: user.firstname,
          lastname: user.lastname,
          gender: user.gender,
          profile_id: user.profile_id,
          image: imageUrl,
          id: user.id,
          packageId: packageId,
          packageName: packageName,
          premium: packageId > 1 ? 1 : 0
        });
      }
      
      // Dashboard data now derived from /user/details response

      // Fetch package information
      try {
        const packageResponse = await apiService.getPackageInfo();
        console.log('📦 Package info response:', packageResponse);
        
        if (packageResponse?.status === 'success' && packageResponse?.data?.package && packageResponse.data.package.id > 0) {
          const packageName = packageResponse.data.package.name || packageResponse.data.package.title || 'Unknown Plan';
          console.log('📦 Package name:', packageName);
          
          // Update user profile with correct package name
          setUserProfile((prev) => ({
            ...prev,
            packageName: packageName,
            packageId: packageResponse.data.package.id,
            premium: packageResponse.data.package.id > 1 ? 1 : 0
          }));
        }
      } catch (packageError) {
        console.log('⚠️ Package info fetch failed:', packageError);
        // Continue with existing package name if fetch fails
      }

      // Fetch all available plans with benefits
      try {
        const plansResponse = await apiService.getAllPlans();
        console.log('📋 All plans response:', plansResponse);
        
        if (plansResponse?.status === 'success' && plansResponse?.data?.plans) {
          setPlanDetails(plansResponse.data.plans);
          console.log('📋 Plans loaded:', plansResponse.data.plans.length);
        }
      } catch (plansError) {
        console.log('⚠️ Plans fetch failed:', plansError);
        // Continue without plans if fetch fails
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Fallback to default values if no user data available
      setDashboardData({
        remaining_contact_view: 0,
        remaining_interests: 0,
        remaining_image_upload: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      await fetchGalleryImages();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddGalleryImage = async () => {
    try {
      if (uploadingGallery) return;
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }
      // Open gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]) return;
      const imageAsset = result.assets[0];
      // build multipart form
      const formData = new FormData();
      formData.append('gallery_image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'gallery.jpg',
      } as any);
      setUploadingGallery(true);
      const resp = await apiService.uploadGalleryImage(formData);
      if (resp.status === 'success') {
        const newUrl = resp.data?.image_url || resp.data?.url || imageAsset.uri;
        setGalleryImages(prev => [{ image: newUrl }, ...prev]);
        // decrement remaining uploads
        setDashboardData(prev => ({ ...prev, remaining_image_upload: (prev.remaining_image_upload ?? 1) - 1 }));
        Alert.alert('Success', 'Photo uploaded');
      } else {
        Alert.alert('Error', resp.message || 'Upload failed');
      }
    } catch(e:any) {
      console.error('Gallery upload error', e);
      Alert.alert('Error', e.message || 'Failed to upload');
    } finally {
      setUploadingGallery(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await apiService.getGalleryImages();
      if (response?.status === 'success' && response?.data) {
        const raw = Array.isArray(response.data) ? response.data : response.data.galleries || response.data.images || [];
        const imgs = raw.map((img:any)=> (typeof img === 'string' ? { image: img } : img));
        // Only update state if API returned at least one image
        if (imgs.length) {
          setGalleryImages(imgs);
        }
      }
      // Do not clear gallery if API returns empty or error – keep existing images
    } catch (error) {
      console.log('⚠️ Gallery fetch failed, keeping existing images');
    }
  };

  const handleCardPress = () => {
    profileCardRef.current?.flipCard();
  };

  const handleMenuItemPress = async (item: { id: string; title: string; icon: IconName }) => {
    if (item.title === 'Logout') {
      try {
        if (logout) {
          await logout();
        }
        router.replace('/(auth)/login');
      } catch (error) {
      }
    } else if (item.title === 'Plans & Pricing') {
      router.push('/plans');
    } else if (item.title === 'Dashboard') {
      // Already on dashboard
    } else if (item.title === 'Purchase History') {
      // router.push('/purchase-history'); // Route doesn't exist yet
    } else if (item.title === 'Gallery') {
      router.push('/gallery');
    } else if (item.title === 'Interest Request') {
      router.push('/interest-sent');
    } else if (item.title === 'Ignored Lists') {
      // router.push('/ignored-lists'); // Route doesn't exist yet
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Open gallery directly
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImage = async (imageAsset: any) => {
    try {
      setUploadingImage(true);
      console.log('📸 Uploading profile image...');
      
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiService.uploadProfileImage(formData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Profile picture updated successfully!');
        // Update userProfile with new image using the URL from API response
        const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
        const newImageUrl = response.data?.image_url || `${imageBaseUrl}/${response.data?.image || response.image}`;
        console.log('🖼️ New image URL:', newImageUrl);
        setUserProfile((prev: any) => ({ ...prev, image: newImageUrl }));
        // Refresh user data if available
        if (auth && 'refreshUser' in auth && typeof auth.refreshUser === 'function') {
          auth.refreshUser();
        }
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const themeStyles = {
    container: theme === 'dark' ? { backgroundColor: '#0F0F0F' } : { backgroundColor: '#FFFFFF' },
    text: theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' },
    secondaryText: theme === 'dark' ? { color: '#B0B0B0' } : { color: '#6B7280' },
    card: theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F8F9FA' },
  };

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Fetch plan details
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setPlanLoading(true);
        const response = await apiService.getDepositMethods();
        
        if (response?.data?.plans) {
          setPlanDetails(response.data.plans);
        } else if (response?.data) {
          setPlanDetails(response.data);
        }
      } catch (error) {
        setPlanDetails(null);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlanDetails();
  }, []);

  const settingsMenuItems = [
    { id: '1', title: 'Personal Information', icon: 'user' },
    { id: '2', title: 'Privacy Centre', icon: 'lock' },
    { id: '3', title: 'Account Status', icon: 'check-circle' },
    { id: '4', title: 'Link History', icon: 'link' },
    { id: '5', title: 'Push Notification', icon: 'bell' },
    { id: '6', title: 'Email Notification', icon: 'mail' },
    { id: '7', title: 'SMS Notification', icon: 'message-square' },
    { id: '8', title: 'Search History', icon: 'search' },
    { id: '9', title: 'Logout', icon: 'log-out' },
  ];

  return (
    <>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}
        translucent={false}
      />
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#DC2626"
            />
          }
        >
        {/* Universal Header with Settings Icon, Language & Theme Toggles */}
        <View style={[styles.headerWithoutGradient, { paddingTop: insets.top }, theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' }]}>
          {/* Top Header Bar */}
          <View style={styles.headerTopBar}>
            {/* Left: Settings Icon */}
            <TouchableOpacity 
              style={styles.settingsIconButton}
              onPress={() => router.push('/settings')}
            >
              <Feather name="settings" size={24} color={theme === 'dark' ? '#FFFFFF' : '#1A1A2E'} />
            </TouchableOpacity>

            {/* Center: Title */}
            <Text style={[styles.headerTopTitle, theme === 'dark' ? { color: '#FFFFFF' } : { color: '#1A1A2E' }]}>
              My Profile
            </Text>

            {/* Right: Language & Theme Toggles */}
            <View style={styles.headerRightToggleIcons}>
              {/* Language Toggle */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => {
                  const newLanguage = language === 'en' ? 'ta' : 'en';
                  setLanguage(newLanguage);
                }}
              >
                <Text style={styles.languageToggleText}>
                  {language === 'en' ? '🇬🇧' : '🇮🇳'}
                </Text>
              </TouchableOpacity>

              {/* Theme Toggle */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={handleThemeToggle}
              >
                <Feather 
                  name={theme === 'dark' ? 'sun' : 'moon'} 
                  size={20} 
                  color={theme === 'dark' ? '#FFFFFF' : '#1A1A2E'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Premium Upgrade Banner - Only show for non-premium users */}
        {userProfile && (String(userProfile.packageName || '').toUpperCase().includes('FREE')) && (
          <LinearGradient
                      colors={['#D4AF37',"#FFD700", '#B8860B']}

            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBannerTop}
          >
            <View style={styles.premiumBannerContent}>
              <View style={styles.premiumBannerText}>
                <Feather name="lock" size={18} color="white" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumBannerTitle}>Unlock Premium Features</Text>
                  <Text style={styles.premiumBannerSubtitle}>Chat, upload photos & more</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.premiumBannerButton}
                onPress={() => router.push('/plans')}
              >
                <Text style={styles.premiumBannerButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
        {/* Settings Menu - Direct Navigation to Settings Screen */}
        {showSettingsMenu && (
          <TouchableOpacity 
            style={styles.settingsMenuOverlay}
            onPress={() => setShowSettingsMenu(false)}
            activeOpacity={1}
          >
            <View style={[styles.settingsDropdown, theme === 'dark' && { backgroundColor: '#2A2A2A' }]}>
              <TouchableOpacity 
                style={[styles.settingsMenuItem, theme === 'dark' && { borderBottomColor: '#3A3A3A' }]}
                onPress={() => {
                  setShowSettingsMenu(false);
                  router.push('/settings');
                }}
              >
                <Feather name="settings" size={20} color="#6B7280" />
                <Text style={[styles.settingsMenuItemText, theme === 'dark' && { color: '#E5E7EB' }]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Premium Profile Card with Modern Design */}
        <View style={[styles.profileCardContainer, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
          {/* Card Header with Gradient Background */}
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCardHeader}
          >
            {/* Profile Image - Large Circle */}
            <View style={styles.profileImageLarge}>
              {isValidProfileImage ? (
                <>
                  <FallbackImage 
                    source={{ uri: profileImageUrl }} 
                    style={styles.profileImageLargeImg}
                  />
                  {userProfile?.premium && (
                    <View style={[styles.crownOverlay, { backgroundColor: getCrownColor(userProfile.packageName)+'30' }]}> 
                      <MaterialCommunityIcons name="crown" size={18} color={getCrownColor(userProfile.packageName)} />
                    </View>
                  )}
                </>
              ) : (
                <Image
                  source={defaultProfileImg}
                  style={styles.profileImageLargeImg}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity 
                style={styles.cameraIconLarge} 
                onPress={handleChangeProfilePicture}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="camera" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Name and Premium Badge */}
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileNameLarge}>
                {userProfile?.firstname} {userProfile?.lastname}
              </Text>
              <View style={styles.premiumBadge}>
                <Feather name="star" size={14} color="#FCD34D" />
                <Text style={styles.premiumBadgeText}>{userProfile?.packageName || 'FREE MATCH'}</Text>
              </View>
              <Text style={styles.profileIdText}>
                Profile ID: {userProfile?.profile_id || userProfile?.id || 'N/A'}
              </Text>
            </View>
          </LinearGradient>

          {/* Stats Section */}
          <View style={[styles.profileStatsSection, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardData?.remaining_interests || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Interest Left</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dashboardData?.remaining_contact_view || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Contact View</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{remainingUploads || '0'}</Text>
              <Text style={[styles.statLabel, theme === 'dark' && { color: '#9CA3AF' }]}>Gallery Upload</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.profileCardActions, theme === 'dark' ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#FFFFFF' }, { paddingHorizontal: 12, gap: 8 }]}>
            <TouchableOpacity 
              style={[styles.actionButtonPrimary, { 
                flex: 1, 
                flexDirection: 'row', 
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#DC2626' : '#DC2626',
                paddingVertical: 10,
                borderRadius: 8,
              }]}
              onPress={() => router.push('/profile-setting')}
            >
              <Feather name="edit-3" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.actionButtonText, { color: 'white' }]}>Edit Profile </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#3A3A3A' : '#E5E7EB',
                backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F9FAFB',
              }]}
              onPress={() => router.push(`/profile/${user?.id}`)}
            >
              <Feather name="eye" size={18} color="#f50c0cff" style={{ marginRight: 8 }} />
              <Text style={[{
                fontSize: 16,
                fontWeight: '500',
                color: '#fc0808ff',
              }]}>my Profile</Text>
            </TouchableOpacity>
            
                      </View>
        </View>


        {/* Tabs Section - Images and My Plan */}
        <View style={[styles.tabsSection, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
          {/* Tab Buttons */}
          <View style={[styles.tabButtonsContainer, theme === 'dark' && { borderBottomColor: '#2A2A2A' }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
              onPress={() => setActiveTab('photos')}
            >
              <Feather name="image" size={20} color={activeTab === 'photos' ? '#DC2626' : '#9CA3AF'} />
              <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive, theme === 'dark' && { color: activeTab === 'photos' ? '#DC2626' : '#9CA3AF' }]}>
                Images
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'plans' && styles.tabButtonActive]}
              onPress={() => setActiveTab('plans')}
            >
              <Feather name="award" size={20} color={activeTab === 'plans' ? '#DC2626' : '#9CA3AF'} />
              <Text style={[styles.tabButtonText, activeTab === 'plans' && styles.tabButtonTextActive, theme === 'dark' && { color: activeTab === 'plans' ? '#DC2626' : '#9CA3AF' }]}>
                My Plan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={[styles.tabContent, theme === 'dark' && { backgroundColor: '#0F0F0F' }]}>
            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <View style={styles.photosContainer}>
                {/* Gallery Images */}
                <View style={styles.photosGrid}>
                  {galleryImages.length > 0 ? (
                    <FlatList
                      data={remainingUploads > 0 ? [{ addButton: true }, ...galleryImages] : galleryImages}
                      numColumns={3}
                      scrollEnabled={false}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => {
                        if (item.addButton) {
                          return (
                            <TouchableOpacity 
                              style={[styles.photoGridItem, theme === 'dark' && { backgroundColor: '#1A1A1A', justifyContent:'center', alignItems:'center' }]}
                              onPress={handleAddGalleryImage}
                            >
                              {uploadingGallery ? (
                                <ActivityIndicator size="small" color="#DC2626" />
                              ) : (
                                <Feather name="plus" size={32} color="#DC2626" />
                              )}
                            </TouchableOpacity>
                          );
                        }
                        const imageUrls = getGalleryImageUrl(item.image || item.url || item.image_url);
                        // skip for addButton index shift
                        const remainingUploadsCount = remainingUploads || 0;
                        const showCount = (index === 1 || (index === 0 && remainingUploads === 0)) && remainingUploadsCount > 0;
                        return (
                          <TouchableOpacity 
                            style={[styles.photoGridItem, theme === 'dark' && { backgroundColor: '#1A1A1A' }]}
                            activeOpacity={0.8}
                            onPress={() => {
                              setViewerIndex(index);
                              setViewerVisible(true);
                            }}
                          >
                            {imageUrls.primary ? (
                              <>
                                <FallbackImage 
                                  source={{ uri: imageUrls.primary }} 
                                  fallbackSource={imageUrls.fallback ? { uri: imageUrls.fallback } : undefined}
                                  style={styles.photoGridImage}
                                />
                                {showCount && (
                                  <View style={styles.uploadCountBadge}>
                                    <Text style={styles.uploadCountText}>{remainingUploads} left</Text>
                                  </View>
                                )}
                              </>
                            ) : (
                              <View style={[styles.photoGridImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <Feather name="image" size={24} color="#9CA3AF" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                      columnWrapperStyle={styles.photoColumnWrapper}
                    />
                  ) : (
                    <View style={styles.emptyPhotosContainer}>
                      <Feather name="image" size={48} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                      <Text style={[styles.emptyPhotosText, theme === 'dark' && { color: '#9CA3AF' }]}>
                        No photos yet
                      </Text>
                      <Text style={[styles.emptyPhotosSubtext, theme === 'dark' && { color: '#6B7280' }]}>
                        {remainingUploads > 0 
                          ? `You have ${remainingUploads} uploads left` 
                          : 'No uploads remaining'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.uploadPhotosButton}
                        onPress={() => {
                          // Check if user is premium
                          const isFreePackage = String(userProfile?.packageId) === '4';
                          if (isFreePackage) {
                            console.log('📸 Non-premium user attempting to upload, showing upgrade prompt');
                            Alert.alert(
                              'Premium Feature',
                              'Photo uploads are available for premium members only. Upgrade to Pro to upload photos.',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => {},
                                  style: 'cancel'
                                },
                                {
                                  text: 'Upgrade to Pro',
                                  onPress: () => {
                                    console.log('🚀 Navigating to plans/upgrade screen');
                                    router.push('/plans');
                                  },
                                  style: 'default'
                                }
                              ]
                            );
                          } else {
                            console.log('📸 Premium user, navigating to gallery');
                            router.push('/gallery');
                          }
                        }}
                      >
                        <Text style={styles.uploadPhotosButtonText}>Upload Photos</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* My Plan Tab */}
            {activeTab === 'plans' && (
              <View style={styles.myPlanContainer}>
                {planLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text style={[styles.loadingText, theme === 'dark' && { color: '#E5E7EB' }]}>Loading plan details...</Text>
                  </View>
                ) : (
                  <>
                    {/* Current Plan Card */}
                    <View style={[styles.planCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                      <View style={styles.planCardHeader}>
                        <Feather name="award" size={24} color="#DC2626" />
                        <Text style={[styles.planCardTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Current Plan</Text>
                      </View>
                      <Text style={[styles.planCardName, theme === 'dark' && { color: '#FFFFFF' }]}>
                        {userProfile?.packageName || 'No Active Plan'}
                      </Text>
                      <Text style={[styles.planCardDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                        {userProfile?.packageName ? 'Your active membership plan' : 'Upgrade to unlock premium features'}
                      </Text>
                    </View>

                    {/* Available Plans */}
                    {planDetails && Array.isArray(planDetails) && planDetails.length > 0 && (
                      <View style={styles.availablePlansSection}>
                        <Text style={[styles.availablePlansTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Available Plans</Text>
                        {planDetails.map((plan: any, index: number) => (
                          <View key={index} style={[styles.planOptionCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                            <View style={styles.planOptionHeader}>
                              <Text style={[styles.planOptionName, theme === 'dark' && { color: '#FFFFFF' }]}>
                                {plan.name || plan.title || `Plan ${index + 1}`}
                              </Text>
                              <Text style={styles.planOptionPrice}>
                                ₹{Number(plan.price ?? plan.amount ?? 0).toFixed(0)}
                              </Text>
                            </View>
                            <Text style={[styles.planOptionDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                              {plan.description || 'Premium membership plan'}
                            </Text>
                            
                            {/* Plan Benefits */}
                            <View style={styles.planBenefitsInline}>
                              {plan.interest_express_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.interest_express_limit} Interests
                                  </Text>
                                </View>
                              )}
                              {plan.contact_view_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.contact_view_limit} Contact Views
                                  </Text>
                                </View>
                              )}
                              {plan.image_upload_limit > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.image_upload_limit} Photo Uploads
                                  </Text>
                                </View>
                              )}
                              {plan.validity_period > 0 && (
                                <View style={styles.benefitItemInline}>
                                  <Feather name="check-circle" size={16} color="#10B981" />
                                  <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                    {plan.validity_period} Days Validity
                                  </Text>
                                </View>
                              )}
                            </View>

                              {/* Pay/Current Button */}
                              <TouchableOpacity
                                disabled={plan.id === userProfile?.packageId}
                                style={[
                                  styles.payNowButton,
                                  plan.id === userProfile?.packageId && styles.payNowButtonDisabled,
                                ]}
                                onPress={() => {
                                  if (plan.id !== userProfile?.packageId) {
                                    handlePayNow(plan.id);
                                  }
                                }}
                              >
                                <Text style={styles.payNowButtonText}>
                                  {plan.id === userProfile?.packageId ? 'Current' : 'Pay Now'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                        ))}
                      </View>
                    )}

                    {/* Get Premium Button */}
                    {!userProfile?.packageName && (
                      <TouchableOpacity 
                        style={styles.upgradePlanButton}
                        onPress={() => router.push('/plans')}
                      >
                        <Feather name="star" size={18} color="white" />
                        <Text style={styles.upgradePlanButtonText}>Upgrade to Premium</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

          </View>
        </View>

        {/* Duplicate My Plan Tab removed */}
        {false && (
          <View style={styles.myPlanContainer}>
            {planLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={[styles.loadingText, theme === 'dark' && { color: '#E5E7EB' }]}>Loading plan details...</Text>
              </View>
            ) : (
              <>
                {/* Current Plan Card */}
                <View style={[styles.planCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                  <View style={styles.planCardHeader}>
                    <Feather name="award" size={24} color="#DC2626" />
                    <Text style={[styles.planCardTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Current Plan</Text>
                  </View>
                  <Text style={[styles.planCardName, theme === 'dark' && { color: '#FFFFFF' }]}>
                    {userProfile?.packageName || 'No Active Plan'}
                  </Text>
                  <Text style={[styles.planCardDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                    {userProfile?.packageName ? 'Your active membership plan' : 'Upgrade to unlock premium features'}
                  </Text>
                </View>

                {/* Available Plans */}
                {planDetails && Array.isArray(planDetails) && planDetails.length > 0 && (
                  <View style={styles.availablePlansSection}>
                    <Text style={[styles.availablePlansTitle, theme === 'dark' && { color: '#E5E7EB' }]}>Available Plans</Text>
                    {planDetails.map((plan: any, index: number) => (
                      <View key={index} style={[styles.planOptionCard, theme === 'dark' && { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }]}>
                        <View style={styles.planOptionHeader}>
                          <Text style={[styles.planOptionName, theme === 'dark' && { color: '#FFFFFF' }]}>
                            {plan.name || plan.title || `Plan ${index + 1}`}
                          </Text>
                          <Text style={styles.planOptionPrice}>
                            ₹{Number(plan.price ?? plan.amount ?? 0).toFixed(0)}
                          </Text>
                        </View>
                        <Text style={[styles.planOptionDescription, theme === 'dark' && { color: '#9CA3AF' }]}>
                          {plan.description || 'Premium membership plan'}
                        </Text>
                        
                        {/* Plan Benefits */}
                        <View style={styles.planBenefitsInline}>
                          {plan.interest_express_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.interest_express_limit} Interests
                              </Text>
                            </View>
                          )}
                          {plan.contact_view_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.contact_view_limit} Contact Views
                              </Text>
                            </View>
                          )}
                          {plan.image_upload_limit > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.image_upload_limit} Photo Uploads
                              </Text>
                            </View>
                          )}
                          {plan.validity_period > 0 && (
                            <View style={styles.benefitItemInline}>
                              <Feather name="check-circle" size={16} color="#10B981" />
                              <Text style={[styles.benefitTextInline, theme === 'dark' && { color: '#9CA3AF' }]}>
                                {plan.validity_period} Days Validity
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Get Premium Button */}
                {!userProfile?.packageName && (
                  <TouchableOpacity 
                    style={styles.upgradePlanButton}
                    onPress={() => router.push('/plans')}
                  >
                    <Feather name="star" size={18} color="white" />
                    <Text style={styles.upgradePlanButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

      
      <View style={styles.bottomPadding} />
    </ScrollView>
    <ImageViewing
      images={viewerImages}
      imageIndex={viewerIndex}
      visible={viewerVisible}
      onImageIndexChange={(i)=>setViewerIndex(i)}
      onRequestClose={() => setViewerVisible(false)}
      HeaderComponent={({ imageIndex }) => (
        <View style={{ position:'absolute', top:50, left:20, right:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center', zIndex:20 }}>
          <TouchableOpacity onPress={()=>setViewerVisible(false)} style={{ padding:6 }}>
            <Feather name="x" size={26} color="white" />
          </TouchableOpacity>
          <Text style={{ color:'white', fontSize:16, fontWeight:'600' }}>{`${imageIndex+1} / ${viewerImages.length}`}</Text>
          <TouchableOpacity onPress={()=>downloadImage && viewerImages[imageIndex] && downloadImage(viewerImages[imageIndex].uri)} style={{ padding:6 }}>
            <Feather name="download" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}
      FooterComponent={({ imageIndex }) => (
        <View style={{ position:'absolute', bottom:40, left:0, right:0, flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
          <TouchableOpacity onPress={()=>setViewerIndex(imageIndex>0 ? imageIndex-1 : viewerImages.length-1)} style={{ padding:10 }}>
            <Feather name="chevron-left" size={32} color="white" />
          </TouchableOpacity>
          <FlatList
            data={viewerImages}
            horizontal
            keyExtractor={(_,idx)=>`viewer-thumb-${idx}`}
            renderItem={({ item, index })=> (
              <TouchableOpacity onPress={()=>setViewerIndex(index)}>
                <Image source={{ uri:item.uri }} style={{ width:50, height:50, marginHorizontal:4, borderRadius:6, borderWidth:2, borderColor: index===imageIndex ? '#DC2626':'transparent' }} />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity onPress={()=>setViewerIndex(imageIndex < viewerImages.length-1 ? imageIndex+1 : 0)} style={{ padding:10 }}>
            <Feather name="chevron-right" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    />
    <View style={styles.bottomPadding} />
  </SafeAreaView>
</>
  );

  const getSummaryStats = (dashboardData: any, loading: boolean): { title: string; value: string; icon: IconName; colors: readonly [ColorValue, ColorValue, ...ColorValue[]] }[] => {
    if (loading) {
      return [
        { title: 'Contact Views Left', value: '...', icon: 'eye', colors: ['#60A5FA', '#3B82F6'] as const },
        { title: 'Interests Left', value: '...', icon: 'heart', colors: ['#FDE68A', '#FBBF24'] as const },
        { title: ' Uploads Left', value: '...', icon: 'camera', colors: ['#EF4444', '#DC2626'] as const },
      ];
    }

    // Handle unlimited values (-1) and format display
    const formatValue = (value: number) => {
      if (value === -1) return '∞';
      return value?.toString() || '0';
    };

    return [
      { 
        title: 'Contact Views Left', 
        value: formatValue(dashboardData?.remaining_contact_view), 
        icon: 'eye', 
        colors: ['#60A5FA', '#3B82F6'] as const 
      },
      { 
        title: 'Interests Left', 
        value: formatValue(dashboardData?.remaining_interests), 
        icon: 'heart', 
        colors: ['#FDE68A', '#FBBF24'] as const 
      },
      { 
        title: 'Uploads Left', 
        value: formatValue(remainingUploads), 
        icon: 'camera', 
        colors: ['#EF4444', '#DC2626'] as const 
      },
    ];
  };

};