import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Feather>['name'];
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import ProfileCard, { ProfileCardRef } from '../../components/ProfileCard';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const menuItems: { id: string; title: string; icon: IconName }[] = [
  { id: '1', title: 'Dashboard', icon: 'layout' },
  { id: '2', title: 'Purchase History', icon: 'settings' },
  { id: '3', title: 'Gallery', icon: 'image' },
  { id: '4', title: 'Interest Request', icon: 'send' },
  { id: '5', title: 'Ignored Lists', icon: 'slash' },
];

export default function AccountScreen() {
  const router = useRouter();
  const profileCardRef = useRef<ProfileCardRef>(null);

  const handleCardPress = () => {
    profileCardRef.current?.flipCard();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.profileCardContainer}>
        <TouchableOpacity onPress={handleCardPress} activeOpacity={1}>
          <ProfileCard ref={profileCardRef} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/settings')}>
          <Feather name="settings" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.publicProfileButton}>
        <Text style={styles.publicProfileButtonText}>Public Profile</Text>
      </TouchableOpacity>

      <View style={styles.summaryContainer}>
        {summaryStats.map((stat, index) => (
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
          <TouchableOpacity key={item.id} style={styles.menuItem}>
            {item.title === 'Dashboard' ? (
              <View style={styles.activeMenuItem}>
                <Feather name={item.icon} size={20} color={Colors.light.tint} />
                <Text style={[styles.menuItemText, styles.activeMenuItemText]}>{item.title}</Text>
                <View style={styles.activeIndicator} />
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

const summaryStats: { title: string; value: string; icon: IconName; colors: readonly [ColorValue, ColorValue, ...ColorValue[]] }[] = [
  { title: 'Remaining Contact View', value: '10', icon: 'eye', colors: ['#60A5FA', '#3B82F6'] as const },
  { title: 'Remaining Interests', value: '15', icon: 'heart', colors: ['#FDE68A', '#FBBF24'] as const },
  { title: 'Remaining Image Upload', value: '05', icon: 'camera', colors: ['#EF4444', '#DC2626'] as const },
];

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
});