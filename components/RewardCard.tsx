import { colors, radii, shadow } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function RewardCard({ name, points, tier, memberCode, compact = false }: { name: string; points: number; tier: string; memberCode: string; compact?: boolean }) {
  return (
    <LinearGradient colors={[colors.teal, colors.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, compact && styles.compact]}>
      <View style={styles.top}>
        <View>
          <Text style={styles.eyebrow}>NAWA MEMBER</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.tier}><Text style={styles.tierText}>{tier.toUpperCase()}</Text></View>
      </View>
      <Text style={styles.label}>Available balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.points}>{points.toLocaleString()}</Text>
        <Text style={styles.value}>≈ AED {(points / 100).toFixed(2)}</Text>
      </View>
      {!compact && (
        <>
          <Text style={styles.member}>{memberCode.replace(/.(?=.{4})/g, "•")}</Text>
          <View style={styles.actions}>
            <CardAction icon="sparkles-outline" label="Earn" onPress={() => router.push("/qr")} />
            <View style={styles.divider} />
            <CardAction icon="gift-outline" label="Redeem" onPress={() => router.push({ pathname: "/qr", params: { mode: "redeem" } })} />
            <View style={styles.divider} />
            <CardAction icon="paper-plane-outline" label="Send" />
          </View>
        </>
      )}
      <View style={styles.orbitOne} />
      <View style={styles.orbitTwo} />
    </LinearGradient>
  );
}

function CardAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Ionicons name={icon} size={20} color={colors.white} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 294, borderRadius: radii.lg, padding: 24, overflow: "hidden", ...shadow },
  compact: { minHeight: 210 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 },
  eyebrow: { color: "#A5D5D1", letterSpacing: 1.5, fontSize: 11, fontWeight: "800" },
  name: { color: colors.white, fontSize: 23, fontWeight: "800", marginTop: 5 },
  tier: { backgroundColor: "rgba(221,190,130,0.22)", borderWidth: 1, borderColor: "rgba(221,190,130,0.6)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  tierText: { color: "#F8D99D", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  label: { color: "#B9D4D4", fontSize: 14, marginTop: 28, zIndex: 2 },
  balanceRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 3, zIndex: 2 },
  points: { color: colors.white, fontSize: 43, fontWeight: "300" },
  value: { color: colors.white, fontSize: 16, marginBottom: 8 },
  member: { color: "#B9D4D4", marginTop: 21, letterSpacing: 2, zIndex: 2 },
  actions: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.16)", flexDirection: "row", alignItems: "center", zIndex: 2 },
  action: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: "100%" },
  actionText: { color: colors.white, fontWeight: "700" },
  divider: { height: 24, width: 1, backgroundColor: "rgba(255,255,255,.24)" },
  orbitOne: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: "rgba(255,255,255,.08)", right: -45, top: 15 },
  orbitTwo: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(49,183,154,.08)", right: 10, top: 50 }
});
