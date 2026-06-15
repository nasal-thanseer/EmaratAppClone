import { colors } from "@/constants/theme";
import { useConnectivity } from "@/providers/ConnectivityProvider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export function OfflineBanner() {
  const { isOnline, isChecking } = useConnectivity();
  if (isOnline || isChecking) return null;
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={17} color={colors.white} />
      <Text style={styles.text}>Offline. Secure account actions are temporarily unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.warning, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 9 },
  text: { color: colors.white, fontSize: 11, fontWeight: "800" }
});
