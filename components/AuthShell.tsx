import { BrandMark } from "@/components/BrandMark";
import { colors, radii } from "@/constants/theme";
import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthShell({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}><BrandMark size={54} /><Text style={styles.wordmark}>NAWA</Text></View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.card}>{children}</View>
          <Text style={styles.note}>Rewards that move with you.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  input: { height: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 16, marginBottom: 13, color: colors.text, backgroundColor: "#FCFCFA" },
  button: { height: 54, backgroundColor: colors.teal, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", marginTop: 5 },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 16 },
  link: { color: colors.teal, fontWeight: "800" },
  helper: { color: colors.muted, textAlign: "center", marginTop: 20 },
  error: { color: colors.error, marginBottom: 12, lineHeight: 19 }
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brand: { flexDirection: "row", alignItems: "center", marginBottom: 35 },
  wordmark: { color: colors.ink, fontSize: 22, fontWeight: "900", letterSpacing: 3, marginLeft: 8 },
  title: { color: colors.ink, fontSize: 34, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 25 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 20 },
  note: { color: colors.muted, textAlign: "center", marginTop: 28, fontSize: 12, letterSpacing: 0.5 }
});
