import { ErrorState, LoadingState } from "@/components/AsyncState";
import { RewardCard } from "@/components/RewardCard";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii } from "@/constants/theme";
import { useMember } from "@/providers/MemberProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const earning = [
  ["Cafe & dining", "2 pts / AED", "cafe-outline"],
  ["Groceries", "1.5 pts / AED", "basket-outline"],
  ["Auto care", "3 pts / AED", "car-sport-outline"],
  ["Wellness", "1 pt / AED", "fitness-outline"]
] as const;

export default function RewardsScreen() {
  const { member, loading, error, refresh } = useMember();
  if (loading) return <Screen header={<TopBar title="Rewards" action="help" />}><LoadingState /></Screen>;
  if (error || !member) return <Screen header={<TopBar title="Rewards" action="help" />}><ErrorState message={error || "Rewards unavailable."} onRetry={() => void refresh()} /></Screen>;
  return (
    <Screen header={<TopBar title="Rewards" action="help" />}>
      <RewardCard compact name={member.profile.full_name} points={member.wallet.points_balance} tier={member.profile.tier} memberCode={member.profile.member_code} />
      <View style={styles.links}>
        <Pressable onPress={() => router.push("/transactions")} style={styles.linkCard}><Ionicons name="receipt-outline" size={24} color={colors.teal} /><View style={{ flex: 1 }}><Text style={styles.linkTitle}>Transactions</Text><Text style={styles.linkBody}>Your earn and redeem activity</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>
        <Pressable onPress={() => router.push("/partners")} style={styles.linkCard}><Ionicons name="storefront-outline" size={24} color={colors.coral} /><View style={{ flex: 1 }}><Text style={styles.linkTitle}>Partners</Text><Text style={styles.linkBody}>Explore where Nawa works</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>
      </View>
      <Text style={styles.heading}>How you earn</Text>
      <View style={styles.table}>
        {earning.map(([name, rate, icon], index) => (
          <View key={name} style={[styles.rateRow, index === earning.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.rateIcon}><Ionicons name={icon} size={20} color={colors.mint} /></View>
            <Text style={styles.rateName}>{name}</Text><Text style={styles.rate}>{rate}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: "row", gap: 12, marginTop: 18 },
  linkCard: { flex: 1, backgroundColor: colors.white, borderRadius: radii.md, padding: 16, gap: 10, minHeight: 145 },
  linkTitle: { color: colors.ink, fontWeight: "900", marginTop: 7 },
  linkBody: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  heading: { color: colors.ink, fontSize: 21, fontWeight: "900", marginTop: 27, marginBottom: 13 },
  table: { backgroundColor: colors.white, borderRadius: radii.md, paddingHorizontal: 16 },
  rateRow: { flexDirection: "row", alignItems: "center", height: 67, borderBottomWidth: 1, borderBottomColor: colors.border },
  rateIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mintSoft, alignItems: "center", justifyContent: "center" },
  rateName: { color: colors.text, fontWeight: "700", marginLeft: 12, flex: 1 },
  rate: { color: colors.teal, fontWeight: "900" }
});
