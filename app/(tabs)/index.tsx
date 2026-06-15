import { ErrorState, LoadingState } from "@/components/AsyncState";
import { RewardCard } from "@/components/RewardCard";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii, shadow } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useMember } from "@/providers/MemberProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { session, isDemo } = useAuth();
  const { member, loading, error, refresh } = useMember();
  if (loading || !session) return <Screen header={<TopBar action="notifications" />}><LoadingState label="Loading your membership..." /></Screen>;
  if (error || !member) return <Screen header={<TopBar action="notifications" />}><ErrorState message={error || "Membership unavailable."} onRetry={() => void refresh()} /></Screen>;
  return (
    <Screen header={<TopBar action="notifications" />}>
      {isDemo && <View style={styles.demo}><Ionicons name="flask-outline" color={colors.teal} size={16} /><Text style={styles.demoText}>Demo data · connect Supabase for live accounts</Text></View>}
      <Text style={styles.greeting}>Good afternoon,</Text>
      <Text style={styles.heading}>{member.profile.full_name.split(" ")[0]}</Text>
      <View style={{ marginTop: 20 }}><RewardCard name={member.profile.full_name} points={member.wallet.points_balance} tier={member.profile.tier} memberCode={member.profile.member_code} /></View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Made for your day</Text><Text style={styles.link} onPress={() => router.push("/partners")}>View partners</Text></View>
      <View style={styles.banner}>
        <View style={{ flex: 1 }}><Text style={styles.bannerKicker}>WEEKEND BOOST</Text><Text style={styles.bannerTitle}>Double points at local cafes</Text><Text style={styles.bannerBody}>Friday to Sunday at selected partners.</Text></View>
        <View style={styles.bannerIcon}><Ionicons name="cafe" size={35} color={colors.teal} /></View>
      </View>
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Your next milestone</Text>
      <View style={styles.challenge}>
        <View style={styles.challengeTop}><Text style={styles.challengeTitle}>Dune Explorer</Text><Text style={styles.challengePoints}>660 pts to go</Text></View>
        <View style={styles.track}><View style={styles.fill} /></View>
        <Text style={styles.challengeBody}>Reach 3,500 points to unlock a partner voucher.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  demo: { flexDirection: "row", gap: 7, backgroundColor: colors.mintSoft, alignSelf: "flex-start", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, marginBottom: 18 },
  demoText: { color: colors.teal, fontSize: 11, fontWeight: "700" },
  greeting: { color: colors.muted, fontSize: 16 },
  heading: { color: colors.ink, fontSize: 34, fontWeight: "900", marginTop: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 13 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  link: { color: colors.coral, fontWeight: "800" },
  banner: { backgroundColor: colors.sand, borderRadius: radii.lg, padding: 22, minHeight: 150, flexDirection: "row", alignItems: "center", overflow: "hidden", ...shadow },
  bannerKicker: { color: colors.tealDark, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  bannerTitle: { color: colors.tealDark, fontSize: 22, fontWeight: "900", lineHeight: 27, marginTop: 8, maxWidth: 220 },
  bannerBody: { color: colors.tealDark, opacity: 0.72, fontSize: 12, marginTop: 7 },
  bannerIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,.45)", alignItems: "center", justifyContent: "center" },
  challenge: { backgroundColor: colors.white, borderRadius: radii.md, padding: 18, marginTop: 13 },
  challengeTop: { flexDirection: "row", justifyContent: "space-between" },
  challengeTitle: { color: colors.text, fontWeight: "800" },
  challengePoints: { color: colors.teal, fontWeight: "800", fontSize: 12 },
  track: { height: 8, backgroundColor: "#E8ECE8", borderRadius: 8, marginTop: 17, overflow: "hidden" },
  fill: { width: "74%", height: "100%", backgroundColor: colors.mint, borderRadius: 8 },
  challengeBody: { color: colors.muted, fontSize: 12, marginTop: 12 }
});
