import { ErrorState, LoadingState } from "@/components/AsyncState";
import { ProtectedScreen } from "@/components/ProtectedScreen";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useMember } from "@/providers/MemberProvider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

export default function ProfileRoute() {
  return <ProtectedScreen><ProfileScreen /></ProtectedScreen>;
}

function ProfileScreen() {
  const { signOut, isDemo, session } = useAuth();
  const [signOutError, setSignOutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { member, loading, error, refresh } = useMember();
  if (loading) return <Screen header={<TopBar title="My profile" back />}><LoadingState /></Screen>;
  if (error || !member) return <Screen header={<TopBar title="My profile" back />}><ErrorState message={error || "Profile unavailable."} onRetry={() => void refresh()} /></Screen>;
  const fields = [
    ["Full name", member.profile.full_name],
    ["Email", isDemo ? "demo@nawa.app" : session?.user.email ?? ""],
    ["Member ID", member.profile.member_code],
    ["Membership tier", member.profile.tier]
  ];
  const initials = member.profile.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  async function handleSignOut() {
    setSigningOut(true); setSignOutError("");
    try { await signOut(); }
    catch (cause) { setSignOutError(cause instanceof Error ? cause.message : "Unable to sign out."); }
    finally { setSigningOut(false); }
  }
  return (
    <Screen header={<TopBar title="My profile" back />}>
      <View style={styles.hero}><View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View><Text style={styles.name}>{member.profile.full_name}</Text><Text style={styles.since}>Member since {new Date(member.profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text></View>
      <View style={styles.card}>
        {fields.map(([label, value]) => <View key={label} style={styles.field}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}
      </View>
      <View style={styles.notice}><Ionicons name="lock-closed-outline" color={colors.teal} size={20} /><Text style={styles.noticeText}>Points and tier are read-only here. All balance changes are made by trusted server operations.</Text></View>
      {signOutError ? <Text style={styles.signOutError}>{signOutError}</Text> : null}
      <Pressable disabled={signingOut} onPress={handleSignOut} style={[styles.logout, signingOut && { opacity: 0.5 }]}><Ionicons name="log-out-outline" size={21} color={colors.error} /><Text style={styles.logoutText}>{signingOut ? "Signing out..." : "Sign out"}</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingVertical: 18 },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.mintSoft, alignItems: "center", justifyContent: "center" },
  initials: { color: colors.teal, fontSize: 24, fontWeight: "900" },
  name: { color: colors.ink, fontSize: 23, fontWeight: "900", marginTop: 13 },
  since: { color: colors.muted, fontSize: 12, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: 18, marginTop: 10 },
  field: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  value: { color: colors.text, fontSize: 15, fontWeight: "800", marginTop: 5 },
  notice: { flexDirection: "row", gap: 10, backgroundColor: "#EAF1F0", padding: 15, borderRadius: radii.md, marginTop: 18 },
  noticeText: { color: colors.teal, fontSize: 11, lineHeight: 17, flex: 1 },
  logout: { height: 54, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F2C5C5", borderRadius: radii.sm, marginTop: 20 },
  logoutText: { color: colors.error, fontWeight: "900" },
  signOutError: { color: colors.error, textAlign: "center", marginTop: 14, fontSize: 12 }
});
