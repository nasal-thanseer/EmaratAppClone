import { ProtectedScreen } from "@/components/ProtectedScreen";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <ProtectedScreen>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.teal,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 3 },
        tabBarStyle: { height: Platform.OS === "ios" ? 88 : 72, paddingTop: 9, borderTopWidth: 0, backgroundColor: colors.white, position: "absolute", borderTopLeftRadius: 28, borderTopRightRadius: 28 }
      }}>
        <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
        <Tabs.Screen name="qr" options={{ title: "QR", tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" color={color} size={size} /> }} />
        <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} /> }} />
        <Tabs.Screen name="menu" options={{ title: "Menu", tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" color={color} size={size} /> }} />
      </Tabs>
    </ProtectedScreen>
  );
}
