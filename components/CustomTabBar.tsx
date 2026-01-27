import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ICONS: any = {
  index: 'home',
  profiles: 'users',
  chats: 'comments',
  saved: 'heart',
  account: 'user',
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();

  const COLORS = {
    background: theme === 'dark' ? '#121212' : '#FFFFFF',
    indicator: theme === 'dark' ? '#2A1A1A' : '#FCE8E6',
    active: '#DC2626',
    inactive: theme === 'dark' ? '#9CA3AF' : '#5F6368',
    border: theme === 'dark' ? '#2A2A2A' : '#E5E7EB',
    ripple: 'rgba(220,38,38,0.15)',
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: COLORS.background }]}>
      <View style={[styles.container, { borderTopColor: COLORS.border }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel ??
            options.title ??
            route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              android_ripple={{ color: 'transparent' }} // keep whole area clickable
              style={styles.tabItem}
            >
              {/* Indicator with ripple but SAME press handler */}
              <View
                style={[
                  styles.indicator,
                  isFocused && { backgroundColor: COLORS.indicator },
                ]}
              >
                <Pressable
                  onPress={onPress}
                  android_ripple={{ color: COLORS.ripple }}
                  style={styles.iconPress}
                >
                  <FontAwesome
                    name={ICONS[route.name] || 'circle'}
                    size={22}
                    color={isFocused ? COLORS.active : COLORS.inactive}
                  />
                </Pressable>
              </View>

              <Text
                style={[
                  styles.label,
                  { color: isFocused ? COLORS.active : COLORS.inactive },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 70 : 64,
    alignItems: 'center',
    borderTopWidth: 1,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  indicator: {
    width: 56,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  iconPress: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
