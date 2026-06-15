import { BrandMark } from "@/components/BrandMark";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function TopBar({ title, back = false, action }: { title?: string; back?: boolean; action?: "notifications" | "help" }) {
  return (
    <View style={styles.bar}>
      {back ? (
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.icon}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      ) : <BrandMark />}
      {title ? <Text style={styles.title}>{title}</Text> : <Text style={styles.wordmark}>NAWA</Text>}
      {action ? (
        <Pressable accessibilityLabel={action} style={styles.icon}>
          <Ionicons name={action === "help" ? "help-circle-outline" : "notifications-outline"} size={24} color={colors.ink} />
        </Pressable>
      ) : <View style={styles.icon} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 72, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.cream },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  wordmark: { position: "absolute", left: 64, fontWeight: "900", letterSpacing: 2.5, color: colors.ink, fontSize: 17 },
  icon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" }
});
