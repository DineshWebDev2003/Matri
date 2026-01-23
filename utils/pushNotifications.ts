import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';

/**
 * Register the device for push notifications and send the Expo push token
 * to the backend so that the server can dispatch notifications.
 *
 * The token is cached in SecureStore under the key `pushToken` to
 * avoid redundant network requests on subsequent app launches.
 */
export async function registerForPushToken(): Promise<string | null> {
  try {
    // Skip if running in Expo Go or not a physical device (Expo Go can't do remote push from SDK 53)
    if (Constants.appOwnership === 'expo' || !Device.isDevice) {
      console.log('🔕 Skipping push token registration (Expo Go or simulator)');
      return null;
    }

    // Get existing stored token (if any)
    const cachedToken = await SecureStore.getItemAsync('pushToken');

    // Check current permission state
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('🔕 Push notification permission not granted');
      return null;
    }

    // Retrieve Expo push token (auto-detect project ID)
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;

    if (!token) {
      console.warn('❗ Failed to obtain Expo push token');
      return null;
    }

    // If token unchanged, skip API call
    if (cachedToken === token) {
      console.log('✅ Push token unchanged, already registered');
      return token;
    }

    // Store token locally & send to backend
    await SecureStore.setItemAsync('pushToken', token);
    console.log('🚀 Registering push token with backend…');
    await apiService.savePushToken(token);

    console.log('✅ Push token registered');
    return token;
  } catch (error) {
    console.error('💥 Failed to register for push notifications:', error);
    return null;
  }
}
