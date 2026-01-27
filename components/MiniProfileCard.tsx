import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { premiumUtils } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface MiniProfileCardProps {
  item: any;
  onPress?: () => void;
  onHeartPress?: () => void;
  interestingProfiles?: any[];
}

const MiniProfileCard: React.FC<MiniProfileCardProps> = ({ item, onPress, onHeartPress, interestingProfiles = [] }) => {
  const { theme } = useTheme();
    const packageId = item?.package_id || item?.packageId || 4;
  const isPremium = premiumUtils.isPremiumUser(packageId);
  const packageTier = premiumUtils.getPackageTier?.(packageId) || 'PREMIUM';

  // Determine ring & label styles
  const pkgColor = premiumUtils.getPackageColor?.(packageId) || '#FBBF24';
  const gradientColors = isPremium
    ? [`${pkgColor}90`, `${pkgColor}50`]
    : ['#F43F5E', '#EC4899'];

  const labelText = packageTier;

  const heartFilled = Array.isArray(interestingProfiles)
    ? interestingProfiles.some((pid:any)=> String(pid)===String(item?.id))
    : interestingProfiles?.has?.(String(item?.id));

    const buildImageUrl = (img?: string) => {
    if (!img) return null;
        if (img.startsWith('http')) return img;
    if (img.includes('/assets')) return `https://${img.replace(/^https?:\/\//, '')}`;
    const base = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
    return `${base}/${img}`;
  };

    const rawImg = item?.image || item?.images?.[0] || item?.profile_image || item?.profileImage || null;
  const profileImage = buildImageUrl(rawImg);
  const firstName = ((item?.firstname || item?.name || '').split(' ')[0]).trim();
  console.log('MiniProfileCard image debug:', { id: item?.id, rawImg, resolved: profileImage });

  return (
    <TouchableOpacity style={styles.cardWrapper} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient colors={gradientColors} style={styles.ringWrapper}>
        <View style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <Feather name="user" size={48} color="#9CA3AF" />
          )}
        </View>
      </LinearGradient>

      {/* Status badge */}
      <View style={[styles.label, isPremium ? styles.premiumLabel : styles.newLabel]}>
        <Text style={[styles.labelText, isPremium ? styles.premiumLabelText : styles.newLabelText]}>{labelText}</Text>
      </View>

      {/* Heart overlay */}
      <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7} onPress={onHeartPress}>
        {heartFilled ? (
          <MaterialCommunityIcons name="heart" size={20} color="#DC2626" />
        ) : (
          <MaterialCommunityIcons name="heart-outline" size={20} color="#D1D5DB" />
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text numberOfLines={1} style={[styles.name, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>{firstName}</Text>
      {/* Age & location row */}
      <Text style={[styles.subtitle, { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }]} numberOfLines={1}>
        {(() => {
          const cityVal = item.city || (typeof item.location === 'string' ? item.location : item.location?.city) || item.city_name || item.present_city || '';
          if (!item.age && !cityVal) return '';
          if (item.age && cityVal) return `${item.age} yrs  •  ${cityVal}`;
          if (item.age) return `${item.age} yrs`;
          return cityVal;
        })()}
      </Text>
    </TouchableOpacity>
  );
};

export default MiniProfileCard;

const CARD_SIZE = 90;

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_SIZE + 20,
    marginRight: 10,
    alignItems: 'center',
  },
  ringWrapper: {
    width: CARD_SIZE + 10,
    height: CARD_SIZE + 10,
    borderRadius: (CARD_SIZE + 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: CARD_SIZE / 2,
  },
  label: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 5,
  },
  newLabel: {
    backgroundColor: '#9CA3AF',
  },
  premiumLabel: {
    backgroundColor: '#FBBF24',
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  newLabelText: {
    color: 'white',
  },
  premiumLabelText: {
    color: '#1F2937',
  },
  heartBtn: {
    position: 'absolute',
    bottom: 45,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    elevation: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    maxWidth: CARD_SIZE + 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
});
