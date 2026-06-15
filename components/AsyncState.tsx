import { colors, radii } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export function LoadingState({ label = "Loading securely..." }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.teal} />
      <Text style={styles.message}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorWrap}>
      <Ionicons name="alert-circle-outline" size={25} color={colors.error} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 12 },
  message: { color: colors.muted, fontSize: 12 },
  errorWrap: { backgroundColor: colors.white, borderRadius: radii.md, padding: 20, alignItems: "center", gap: 10 },
  errorText: { color: colors.error, textAlign: "center", lineHeight: 19 },
  retry: { backgroundColor: colors.teal, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  retryText: { color: colors.white, fontWeight: "800", fontSize: 12 }
});
