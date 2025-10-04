import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, FlatList, ImageBackground, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

const banners = [
  { id: '1', title: 'Meet and Greet', location: 'Vadapalani, Chennai', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', title: 'Music Festival', location: 'ECR, Chennai', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' },
  { id: '3', title: 'Art Expo', location: 'Nungambakkam, Chennai', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop' },
];

const getStats = (t: (key: string) => string) => [
  { label: t('interest_requests'), value: '02', icon: 'user-check', gradient: ['#60A5FA', '#3B82F6'], route: '/interest-received' },
  { label: t('interest_sent'), value: '01', icon: 'send', gradient: ['#FDE68A', '#FBBF24'], route: '/interest-sent' },
  { label: t('total_shortlist'), value: '06', icon: 'heart', gradient: ['#EF4444', '#DC2626'], route: '/shortlisted' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [selectedBanner, setSelectedBanner] = useState(0);
  const [newlyJoinedProfiles, setNewlyJoinedProfiles] = useState([]);
  const [newMatchesProfiles, setNewMatchesProfiles] = useState([]);
  const scrollX = new Animated.Value(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textAnim = useState(new Animated.Value(0))[0];
  const logoAnim = useState(new Animated.Value(0))[0];
  const logoScale = useState(new Animated.Value(1))[0];
  const logoRotate = useState(new Animated.Value(0))[0];
  const cursorOpacity = useState(new Animated.Value(0))[0];
  const toggleAnim = useState(new Animated.Value(language === 'en' ? 1 : 0))[0];
  
  const stats = getStats(t);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ta' : 'en';
    const toValue = newLanguage === 'en' ? 1 : 0;
    
    Animated.spring(toggleAnim, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
    
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const fullText = `Hi, ${userInfo?.firstname || 'User'}`;
    let index = 0;

    if (isTyping) {
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            Animated.timing(textAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              setIsTyping(false);
                // Enhanced logo animation with scale, rotation and bounce
                Animated.parallel([
              Animated.spring(logoAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
                  }),
                  Animated.sequence([
                    Animated.timing(logoScale, {
                      toValue: 1.2,
                      duration: 300,
                      useNativeDriver: true,
                    }),
                    Animated.spring(logoScale, {
                      toValue: 1,
                      friction: 6,
                      useNativeDriver: true,
                    }),
                  ]),
                  Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                ]).start();
              });
            }, 1500); // Increased delay for better effect
        }
      }, 150);

      return () => clearInterval(typingInterval);
    } else {
      const imageVisibleTimeout = setTimeout(() => {
        Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setDisplayedText('');
          setIsTyping(true);
          textAnim.setValue(0);
          logoScale.setValue(1);
          logoRotate.setValue(0);
        });
      }, 4000); // Increased display time from 2000 to 4000ms

      return () => clearTimeout(imageVisibleTimeout);
    }
  }, [isTyping, userInfo]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (auth?.token) {
        try {
          const response = await axios.get('https://app.90skalyanam.com/api/user-info', {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          console.log('User info response:', response.data);
          if (response.data.status === 'success') {
            setUserInfo(response.data.data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
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

    const fetchProfiles = async () => {
      try {
        // Fetch newly joined profiles
        const newlyJoinedResponse = await apiService.getProfiles({ type: 'newly_joined', limit: 3 });
        if (newlyJoinedResponse.status === 'success') {
          setNewlyJoinedProfiles(newlyJoinedResponse.data.profiles || []);
        }

        // Fetch new matches profiles
        const newMatchesResponse = await apiService.getProfiles({ type: 'new_matches', limit: 3 });
        if (newMatchesResponse.status === 'success') {
          setNewMatchesProfiles(newMatchesResponse.data.profiles || []);
        }
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
        setNewlyJoinedProfiles([]);
        setNewMatchesProfiles([]);
      }
    };

    fetchUserInfo();
    fetchProfiles();
  }, [auth?.token, auth?.user]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Animated.View style={{
              opacity: textAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [{
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }],
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.headerTitle}>{displayedText}</Text>
                {isTyping && displayedText.length < `Hi, ${userInfo?.firstname || 'User'}`.length && (
                  <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
                )}
              </View>
            </Animated.View>

            <Animated.Image
              source={{ uri: 'https://app.90skalyanam.com/assets/images/logoIcon/logo.png' }}
              style={[
                styles.logo,
                {
                  opacity: logoAnim,
                  transform: [
                    { scale: Animated.multiply(logoAnim, logoScale) },
                    { 
                      rotateZ: logoRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }) 
                    }
                  ],
                  position: 'absolute',
                },
              ]}
            />
            <Image source={{ uri: 'https://app.90skalyanam.com/assets/images/logoIcon/logo.png' }} style={[styles.logo, { opacity: 0 }]} />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.animatedToggle}
              onPress={toggleLanguage}
              activeOpacity={0.8}
            >
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleLabel, { color: language === 'ta' ? '#fff' : '#666' }]}>தமிழ்</Text>
                <Animated.View 
                  style={[
                    styles.toggleSlider,
                    {
                      transform: [{
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, 32],
                        })
                      }]
                    }
                  ]}
                />
                <Text style={[styles.toggleLabel, { color: language === 'en' ? '#fff' : '#666' }]}>EN</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.bellIcon}>
              <Feather name="bell" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput placeholder={t('search_placeholder')} style={styles.searchInput} />
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
            <TouchableOpacity key={index} style={styles.statCardTouchableOpacity} onPress={() => router.push(stat.route)}>
              <LinearGradient colors={stat.gradient} style={styles.statCard}>
                <Feather name={stat.icon as any} size={24} color="white" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('just_joined')}</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profiles', params: { initialTab: 'Newly joined' } })}><Text style={styles.viewAll}>{t('view_all')}</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={newlyJoinedProfiles}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/profile/${item?.id || '1'}`)} style={styles.profileCard}>
              <Image source={{ uri: item?.images?.[0] || 'https://randomuser.me/api/portraits/women/1.jpg' }} style={styles.profileImage} />
              <Text style={styles.profileName}>{item?.name || 'User'}</Text>
              <Text style={styles.profileLocation}>{item?.location || 'Chennai'}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recommended_matches')}</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profiles', params: { initialTab: 'Recommended Matches' } })}><Text style={styles.viewAll}>{t('view_all')}</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={newMatchesProfiles}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/profile/${item?.id || '1'}`)} style={styles.profileCard}>
              <Image source={{ uri: item?.images?.[0] || 'https://randomuser.me/api/portraits/women/1.jpg' }} style={styles.profileImage} />
              <Text style={styles.profileName}>{item?.name || 'User'}</Text>
              <Text style={styles.profileLocation}>{item?.location || 'Chennai'}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  logo: { width: 120, height: 60, resizeMode: 'contain' },
  cursor: { width: 2, height: 28, backgroundColor: 'black', marginLeft: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  animatedToggle: {
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    width: 80,
    height: 32,
    backgroundColor: '#333',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    position: 'relative',
  },
  toggleSlider: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1,
  },
  bellIcon: {
    padding: 5,
  },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  searchInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, marginRight: 10 },
  searchButton: { backgroundColor: Colors.light.tint, padding: 12, borderRadius: 10 },
  banner: { width: 300, height: 150, marginRight: 15, justifyContent: 'flex-end', padding: 15 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16 },
  bannerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bannerLocation: { color: 'white', fontSize: 14 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, paddingVertical: 15 },
  statCardTouchableOpacity: { flex: 1, marginHorizontal: 5 },
  statCard: { height: 110, borderRadius: 10, padding: 10, alignItems: 'center', justifyContent: 'space-around' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'white', marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { color: Colors.light.tint, fontWeight: '600' },
  profileCard: { marginRight: 15, alignItems: 'center' },
  profileImage: { width: 120, height: 120, borderRadius: 16 },
  profileName: { marginTop: 8, fontWeight: 'bold' },
  profileLocation: { fontSize: 12, color: 'gray' },
});