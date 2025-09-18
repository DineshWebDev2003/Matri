import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export interface ProfileCardRef {
  flipCard: () => void;
}

interface ProfileCardProps {
  userProfile?: any;
}

const ProfileCard = forwardRef<ProfileCardRef, ProfileCardProps>(({ userProfile }, ref) => {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  
  const profile = {
    name: userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : (user?.name || 'Dinesh M'),
    id: `ID : ${userProfile?.profile_id || user?.id || '54879108'}`,
    profileImage: userProfile?.image || user?.profileImage || null,
    plan: 'Premium Plan',
    isPremium: true,
    firstLetter: userProfile?.firstname?.charAt(0)?.toUpperCase() || user?.firstname?.charAt(0)?.toUpperCase() || 'U',
  };

  
    const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped((prev) => !prev);
    });
  };

  useImperativeHandle(ref, () => ({
    flipCard,
  }));

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const renderFront = () => (
    <Animated.View style={[styles.card, frontAnimatedStyle]}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{profile.firstLetter}</Text>
              </LinearGradient>
            </View>
          )}
          <TouchableOpacity style={styles.editIconContainer}>
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <MaterialIcons name="verified" size={24} color="#3B82F6" style={styles.verifiedBadge} />
          </View>
          <Text style={styles.profileId}>{profile.id}</Text>
          <View style={styles.planContainer}>
            <Text style={styles.planText}>{profile.plan}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBack = () => (
    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
      <LinearGradient 
        colors={profile.isPremium ? ['#FFD700', '#FDB813'] : ['#DC2626', '#C53030']}
        style={styles.backGradient}
      >
        <Text style={styles.backTitle}>Current Plan</Text>
        <Text style={styles.backPlanName}>{profile.plan}</Text>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={[styles.backButton, profile.isPremium && styles.premiumButton]} onPress={() => router.push('/update-plan')}>
            <Text style={[styles.backButtonText, profile.isPremium && styles.premiumButtonText]}>Update Plan</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.profileContainer}>
      {renderFront()}
      {renderBack()}
    </View>
  );
});

export default ProfileCard;

const styles = StyleSheet.create({
  profileContainer: {
    height: 160, // Fixed height for flipping
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
  },
  cardBack: {
    backgroundColor: '#C6222F',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    flex: 1,
    position: 'relative',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F0F0F0',
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#C6222F',
    borderRadius: 15,
    padding: 8,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  verifiedBadge: {
    marginLeft: 8,
  },
  profileId: { fontSize: 16, color: 'gray', marginTop: 5 },
    planContainer: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderColor: '#FEEBC8',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  planText: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 12,
  },
  backGradient: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  backPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    width: '80%',
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#422006',
  },
  backButtonText: {
    color: '#C53030',
    fontWeight: 'bold',
    fontSize: 16,
  },
  premiumButtonText: {
    color: 'white',
  },
});
