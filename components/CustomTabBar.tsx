import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Reverting to the original icons
const ICONS = {
  index: 'home',
  profiles: 'users',
  chats: 'comment',
  saved: 'heart',
  account: 'user',
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const TAB_BAR_WIDTH = width - 20; // 10px margin on each side
  const TAB_COUNT = state.routes.length;
  const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate the horizontal position for the indicator
    const left = state.index * TAB_WIDTH;
    return {
      transform: [{ translateX: withSpring(left, { damping: 15, stiffness: 120 }) }],
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      {/* Sliding pill indicator */}
      <Animated.View style={[styles.indicator, { width: TAB_WIDTH }, animatedStyle]} />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

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
            style={styles.tabItem}
          >
            <FontAwesome name={iconName} size={24} color={isFocused ? Colors.light.tint : Colors.light.icon} />
            <Text style={[styles.labelText, { color: isFocused ? Colors.light.tint : Colors.light.icon }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80, // Increased height for better spacing
    position: 'absolute',
    bottom: 15,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20, // Reduced corner radius
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure icons are on top of the indicator
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Light red tint for the active tab
    borderRadius: 20, // Reduced corner radius
  },
  labelText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
