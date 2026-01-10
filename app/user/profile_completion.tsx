// Expo Router bridge file
// Reason: Some parts of the codebase (or deep links) still reference the legacy
// route "app/user/profile_completion". We re-export the actual screen component
// that now lives under "app/(auth)/profile-completion" to avoid Metro bundler
// errors without duplicating logic.

export { default } from "../(auth)/profile-completion";
