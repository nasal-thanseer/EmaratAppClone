import * as Linking from "expo-linking";
import { Platform } from "react-native";

export type AuthCallbackDestination = "/(tabs)" | "/reset-password";

export function createAuthCallbackUrl(next: AuthCallbackDestination) {
  const callbackPath = `/auth/callback?next=${encodeURIComponent(next)}`;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return new URL(callbackPath, window.location.origin).toString();
  }

  return Linking.createURL(callbackPath);
}
