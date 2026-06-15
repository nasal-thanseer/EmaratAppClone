import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConnectivityProvider } from "@/providers/ConnectivityProvider";
import { MemberProvider } from "@/providers/MemberProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <ConnectivityProvider>
      <AuthProvider>
        <MemberProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transactions" />
            <Stack.Screen name="partners" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="merchant-scanner" />
          </Stack>
        </MemberProvider>
      </AuthProvider>
    </ConnectivityProvider>
  );
}
