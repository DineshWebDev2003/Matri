import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Feather>['name'];
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import ProfileCard, { ProfileCardRef } from '../../components/ProfileCard';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';

const menuItems: { id: string; title: string; icon: IconName }[] = [
  { id: '1', title: 'Dashboard', icon: 'layout' },
  { id: '2', title: 'Purchase History', icon: 'settings' },
  { id: '3', title: 'Gallery', icon: 'image' },
  { id: '4', title: 'Interest Request', icon: 'send' },
  { id: '5', title: 'Ignored Lists', icon: 'slash' },
  { id: '6', title: 'Logout', icon: 'log-out' },
];

export default function AccountScreen() {
  const router = useRouter();
  const profileCardRef = useRef<ProfileCardRef>(null);
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data for account screen...');
      
      // Get dashboard data which contains user info
      const dashboardResponse = await apiService.getDashboard();
      console.log('📈 Dashboard API response:', dashboardResponse);
      
      // Dashboard API returns user data directly, not wrapped in data object
      if (dashboardResponse && dashboardResponse.id) {
        // Set dashboard data for stats
        setDashboardData({
          remaining_contact_view: dashboardResponse.remaining_contact_view || 0,
          remaining_interests: dashboardResponse.remaining_interests || 0,
          remaining_image_upload: dashboardResponse.remaining_image_upload || 0,
        });
        
        // Set user profile data from dashboard response
        setUserProfile({
          firstname: dashboardResponse.firstname,
          lastname: dashboardResponse.lastname,
          profile_id: dashboardResponse.profile_id,
          image: dashboardResponse.image ? `https://app.90skalyanam.com/assets/images/user/profile/${dashboardResponse.image}` : null,
          id: dashboardResponse.id
        });
        
        console.log('✅ Dashboard and profile data set successfully');
        console.log('👤 Profile ID:', dashboardResponse.profile_id);
        console.log('👤 Name:', dashboardResponse.firstname, dashboardResponse.lastname);
      } else {
        console.log('⚠️ Dashboard response format unexpected, using defaults');
        setDashboardData({
          remaining_contact_view: 0,
          remaining_interests: 0,
          remaining_image_upload: 0,
        });
      }
    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      // Fallback to default values
      setDashboardData({
        remaining_contact_view: 0,
        remaining_interests: 0,
        remaining_image_upload: 0,
      });
    } finally {
      setLoading(false);
      console.log('⏹️ Dashboard loading complete');
    }
  };

  const handleCardPress = () => {
    profileCardRef.current?.flipCard();
  };

  const handleMenuItemPress = async (item: { id: string; title: string; icon: IconName }) => {
    if (item.title === 'Logout') {
      try {
        await logout();
        router.replace('/(auth)/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    // Handle other menu items here if needed
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.profileCardContainer}>
        <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
          <ProfileCard ref={profileCardRef} userProfile={userProfile} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/settings')}>
          <Feather name="settings" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.publicProfileButton}>
        <Text style={styles.publicProfileButtonText}>Public Profile</Text>
      </TouchableOpacity>

      <View style={styles.summaryContainer}>
        {getSummaryStats(dashboardData, loading).map((stat, index) => (
          <TouchableOpacity key={index} style={styles.statCardTouchableOpacity}>
            <LinearGradient colors={stat.colors} style={styles.statCard}>
              <Feather name={stat.icon} size={24} color="white" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleMenuItemPress(item)}>
            {item.title === 'Dashboard' ? (
              <View style={styles.activeMenuItem}>
                <Feather name={item.icon} size={20} color={Colors.light.tint} />
                <Text style={[styles.menuItemText, styles.activeMenuItemText]}>{item.title}</Text>
                <View style={styles.activeIndicator} />
              </View>
            ) : item.title === 'Logout' ? (
              <View style={styles.logoutMenuItem}>
                <Feather name={item.icon} size={20} color="#EF4444" />
                <Text style={[styles.menuItemText, styles.logoutMenuItemText]}>{item.title}</Text>
              </View>
            ) : (
              <>
                <Feather name={item.icon} size={20} color="#888" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getSummaryStats = (dashboardData: any, loading: boolean): { title: string; value: string; icon: IconName; colors: readonly [ColorValue, ColorValue, ...ColorValue[]] }[] => {
  if (loading) {
    return [
      { title: 'Remaining Contact View', value: '...', icon: 'eye', colors: ['#60A5FA', '#3B82F6'] as const },
      { title: 'Remaining Interests', value: '...', icon: 'heart', colors: ['#FDE68A', '#FBBF24'] as const },
      { title: 'Remaining Image Upload', value: '...', icon: 'camera', colors: ['#EF4444', '#DC2626'] as const },
    ];
  }

  return [
    { 
      title: 'Remaining Contact View', 
      value: dashboardData?.remaining_contact_view?.toString() || '0', 
      icon: 'eye', 
      colors: ['#60A5FA', '#3B82F6'] as const 
    },
    { 
      title: 'Remaining Interests', 
      value: dashboardData?.remaining_interests?.toString() || '0', 
      icon: 'heart', 
      colors: ['#FDE68A', '#FBBF24'] as const 
    },
    { 
      title: 'Remaining Image Upload', 
      value: dashboardData?.remaining_image_upload?.toString() || '0', 
      icon: 'camera', 
      colors: ['#EF4444', '#DC2626'] as const 
    },
  ];
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  profileCardContainer: {
    margin: 20,
    position: 'relative',
    height: 160, // Match ProfileCard height
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  publicProfileButton: {
    marginHorizontal: 40,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
  },
  publicProfileButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, marginBottom: 20 },
  statCardTouchableOpacity: { flex: 1, marginHorizontal: 5 },
  statCard: { height: 110, borderRadius: 10, padding: 10, alignItems: 'center', justifyContent: 'space-around' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'white', marginTop: 4, textAlign: 'center' },
  menuContainer: { marginHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
    menuItemText: { fontSize: 16, marginLeft: 20, color: '#555' },
  activeMenuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    position: 'relative',
  },
  activeMenuItemText: { color: Colors.light.tint, fontWeight: 'bold' },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 4,
    backgroundColor: Colors.light.tint,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  logoutMenuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  logoutMenuItemText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});