import { Alert, Platform } from 'react-native';

// In production build, replace Alert.alert / prompt / confirm with no-ops to avoid disruptive pop-ups
if (!__DEV__) {
  const noop = () => {};
  // @ts-ignore
  Alert.alert = noop;
  // @ts-ignore
  Alert.prompt = noop;
  // Custom Android confirm dialogs sometimes use Alert.alert with two buttons,
  // so overriding alert is enough. Keep reference for possible logging.
}

// Optionally export nothing – just importing this file applies the patch.
export {};
