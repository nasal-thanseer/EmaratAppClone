import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}><ActivityIndicator color={colors.teal} /></View>;
  return <Redirect href={session ? "/(tabs)" : "/login"} />;
}
