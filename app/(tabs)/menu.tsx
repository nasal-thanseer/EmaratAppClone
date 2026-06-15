import { ErrorState, LoadingState } from "@/components/AsyncState";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii } from "@/constants/theme";
import { useMember } from "@/providers/MemberProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const items = [
  ["Our services", "grid-outline"],
  ["Membership details", "card-outline"],
  ["FAQ", "help-circle-outline"],
  ["Privacy policy", "shield-checkmark-outline"],
  ["Terms & conditions", "document-text-outline"],
  ["About Nawa", "information-circle-outline"],
  ["Contact us", "chatbubble-ellipses-outline"]
] as const;

export default function MenuScreen() {
  const { isMerchant, isDemo } = useAuth();
  const { member, loading, error, refresh } = useMember();
  if (loading) return <Screen header={<TopBar title="Menu" />}><LoadingState /></Screen>;
  if (error || !member) return <Screen header={<TopBar title="Menu" />}><ErrorState message={error || "Menu unavailable."} onRetry={() => void refresh()} /></Screen>;
  const initials = member.profile.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <Screen header={<TopBar title="Menu" />}>
      <Pressable onPress={() => router.push("/profile")} style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.name}>{member.profile.full_name}</Text><Text style={styles.detail}>{member.profile.tier} member · View profile</Text></View>
        <Ionicons name="settings-outline" size={23} color={colors.teal} />
      </Pressable>
      <View style={styles.list}>
        {items.map(([label, icon]) => (
          <Pressable key={label} style={styles.row}>
            <Ionicons name={icon} size={21} color={colors.teal} /><Text style={styles.label}>{label}</Text><Ionicons name="chevron-forward" size={19} color={colors.muted} />
          </Pressable>
        ))}
      </View>
      {isMerchant || isDemo ? <Pressable onPress={() => router.push("/merchant-scanner")} style={styles.merchant}><Ionicons name="scan-outline" size={23} color={colors.coral} /><View style={{ flex: 1 }}><Text style={styles.merchantTitle}>Merchant scanner</Text><Text style={styles.merchantText}>Protected staff workspace</Text></View><Ionicons name="chevron-forward" size={19} color={colors.coral} /></Pressable> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: "row", alignItems: "center", padding: 18, backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: 20 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.mintSoft, alignItems: "center", justifyContent: "center", marginRight: 13 },
  initials: { color: colors.teal, fontWeight: "900" },
  name: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  detail: { color: colors.muted, fontSize: 12, marginTop: 4 },
  list: { backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: 17 },
  row: { height: 63, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.text, fontSize: 15, fontWeight: "700", flex: 1, marginLeft: 13 },
  merchant: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#F5C5BA", backgroundColor: "#FFF4F1", borderRadius: radii.md, padding: 17, marginTop: 18 },
  merchantTitle: { color: colors.ink, fontWeight: "900" },
  merchantText: { color: colors.muted, fontSize: 11, marginTop: 3 }
});
