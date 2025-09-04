import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProfileCard from '../components/ProfileCard';
import { Stack, useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof Feather>['name'];

const menuItems: { id: string; title: string; icon: IconName; route?: string }[] = [
  { id: '1', title: 'Support Tickets', icon: 'life-buoy', route: '/support-tickets' },
  { id: '2', title: 'Profile Setting', icon: 'user', route: '/profile-setting' },
  { id: '3', title: 'Change Password', icon: 'lock', route: '/change-password' },
  { id: '4', title: 'Sign Out', icon: 'log-out' },
];

export default function SettingsScreen() {
  const router = useRouter();

  const handleMenuItemPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
    // Handle sign out or other actions here
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Account' }} />
      <ProfileCard showSettingsButton={false} />

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              item.title === 'Profile Setting' && styles.activeMenuItem,
              index === menuItems.length - 1 && styles.lastMenuItem,
            ]}
            onPress={() => handleMenuItemPress(item.route)}
          >
            <View style={styles.iconContainer}>
              {item.title === 'Profile Setting' && <View style={styles.activeIndicator} />}
              <Feather
                name={item.icon}
                size={22}
                color={item.title === 'Profile Setting' ? '#C6222F' : '#555'}
                style={styles.menuItemIcon}
              />
            </View>
            <Text style={[styles.menuItemText, item.title === 'Profile Setting' && styles.activeMenuItemText]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  menuContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeMenuItem: {
    backgroundColor: '#FFF1F2',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: '#C6222F',
    marginRight: 10,
  },
  menuItemIcon: {
    marginLeft: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  activeMenuItemText: {
    color: '#C6222F',
    fontWeight: 'bold',
  },
});
