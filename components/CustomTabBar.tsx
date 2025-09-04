import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

// Reverting to the original icons
const ICONS = {
  index: 'compass',
  profiles: 'users',
  account: 'user', // This is a placeholder, the actual icon is the user's profile picture
  chats: 'comments',
  saved: 'heart',
};

const UserProfileIcon = ({ isFocused }) => {
  const { user } = useAuth();
  const profileImage = user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop';

  const size = 32;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = 0.75; // 75% progress
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke="#e6e6e6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={Colors.light.tint}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Image
        source={{ uri: profileImage }}
        style={{
          width: size - 8,
          height: size - 8,
          borderRadius: (size - 8) / 2,
          position: 'absolute',
          borderColor: 'white',
          borderWidth: 2,
        }}
      />
    </View>
  );
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const isCenter = route.name === 'account';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = ICONS[route.name] || 'circle';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[styles.tabItem, isCenter ? styles.centerTab : {} ]}
          >
            {route.name === 'account' ? (
              <UserProfileIcon isFocused={isFocused} />
            ) : (
              <FontAwesome name={iconName} size={isFocused ? 26 : 24} color={isFocused ? Colors.light.tint : Colors.light.icon} />
            )}
            {!isCenter && (
            <Text style={[styles.labelText, { color: isFocused ? Colors.light.tint : Colors.light.icon }]}>
              {label}
            </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 65,
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    marginTop: -30,
    backgroundColor: Colors.light.tint,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.light.tint,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  labelText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
