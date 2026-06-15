import { ErrorState, LoadingState } from "@/components/AsyncState";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TopBar } from "@/components/TopBar";
import { colors, radii, shadow } from "@/constants/theme";
import { useConnectivity } from "@/providers/ConnectivityProvider";
import { useMember } from "@/providers/MemberProvider";
import { createRedemptionToken } from "@/services/rewards";
import { RedemptionToken } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Mode = "earn" | "redeem";

export default function QRScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const { member, loading: memberLoading, error: memberError, refresh: refreshMember } = useMember();
  const { isOnline } = useConnectivity();
  const [mode, setMode] = useState<Mode>(params.mode === "redeem" ? "redeem" : "earn");
  const [points, setPoints] = useState("");
  const [redemption, setRedemption] = useState<RedemptionToken | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") setRedemption(null);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!redemption) return;
    const update = () => setRemaining(Math.max(0, Math.floor((new Date(redemption.expires_at).getTime() - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [redemption]);

  const expired = redemption !== null && remaining <= 0;

  async function createCode() {
    const amount = Number(points);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a positive whole number of points.");
      return;
    }
    setLoading(true); setError("");
    try {
      setRedemption(await createRedemptionToken(amount));
    }
    catch (e) { setError(e instanceof Error ? e.message : "Could not create redemption."); }
    finally { setLoading(false); }
  }

  if (memberLoading) return <Screen header={<TopBar title="My QR" action="help" />}><LoadingState /></Screen>;
  if (memberError || !member) return <Screen header={<TopBar title="My QR" action="help" />}><ErrorState message={memberError || "Membership unavailable."} onRetry={() => void refreshMember()} /></Screen>;
  return (
    <Screen header={<TopBar title="My QR" action="help" />}>
      <SegmentedControl options={["earn", "redeem"] as const} value={mode} onChange={(next) => { setMode(next); setRedemption(null); setError(""); }} />
      {mode === "earn" ? (
        <>
          <Text style={styles.title}>Collect points</Text>
          <Text style={styles.subtitle}>Let authorized merchant staff scan your member code, then confirm the purchase amount.</Text>
          <View style={styles.qrCard}>
            <View style={styles.qrFrame}><QRCode value={member.profile.member_code} size={210} color={colors.ink} backgroundColor={colors.white} /></View>
            <Text style={styles.memberCode}>{member.profile.member_code}</Text>
            <View style={styles.secure}><Ionicons name="shield-checkmark" size={16} color={colors.success} /><Text style={styles.secureText}>Static member code · points awarded by server RPC</Text></View>
          </View>
          <View style={styles.info}><Ionicons name="information-circle-outline" size={22} color={colors.teal} /><Text style={styles.infoText}>Points are calculated and added by the merchant system. You cannot edit your own balance.</Text></View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Redeem points</Text>
          <Text style={styles.subtitle}>Create a one-time code for the merchant. It expires automatically after five minutes.</Text>
          {!redemption ? (
            <View style={styles.formCard}>
              <Text style={styles.label}>Points to redeem</Text>
              <TextInput keyboardType="number-pad" placeholder="Points amount" value={points} onChangeText={setPoints} style={styles.input} />
              <Text style={styles.available}>{member.wallet.points_balance.toLocaleString()} server-verified points available</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable onPress={createCode} disabled={loading || !isOnline} style={[styles.button, (loading || !isOnline) && styles.disabled]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{isOnline ? "Generate secure QR" : "Unavailable offline"}</Text>}</Pressable>
            </View>
          ) : (
            <View style={[styles.qrCard, expired && { opacity: 0.52 }]}>
              <View style={styles.timer}><Ionicons name="time-outline" size={18} color={expired ? colors.error : colors.coral} /><Text style={[styles.timerText, expired && { color: colors.error }]}>{expired ? "Code expired" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`}</Text></View>
              <View style={styles.qrFrame}>{expired ? <Ionicons name="ban-outline" size={150} color={colors.muted} /> : <QRCode value={`nawa:redeem:${redemption.token}`} size={210} color={colors.ink} />}</View>
              <Text style={styles.redeemAmount}>{redemption.points.toLocaleString()} points</Text>
              {expired && <Pressable onPress={() => setRedemption(null)}><Text style={styles.retry}>Create a new code</Text></Pressable>}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 28, fontWeight: "900", marginTop: 28 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 22 },
  qrCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 24, alignItems: "center", ...shadow },
  qrFrame: { width: 246, height: 246, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  memberCode: { color: colors.ink, fontWeight: "900", letterSpacing: 2.3, marginTop: 20 },
  secure: { flexDirection: "row", gap: 7, alignItems: "center", marginTop: 14, backgroundColor: colors.mintSoft, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20 },
  secureText: { color: colors.success, fontSize: 10, fontWeight: "700" },
  info: { flexDirection: "row", gap: 11, backgroundColor: "#EAF1F0", borderRadius: radii.md, padding: 16, marginTop: 18 },
  infoText: { color: colors.teal, fontSize: 12, lineHeight: 18, flex: 1 },
  formCard: { backgroundColor: colors.white, padding: 20, borderRadius: radii.lg },
  label: { color: colors.text, fontWeight: "800", marginBottom: 9 },
  input: { height: 58, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 16, fontSize: 20, color: colors.text },
  available: { color: colors.muted, fontSize: 12, marginTop: 8 },
  error: { color: colors.error, marginTop: 12, fontSize: 12 },
  button: { height: 54, backgroundColor: colors.teal, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", marginTop: 20 },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: "800" },
  timer: { flexDirection: "row", gap: 7, alignItems: "center", marginBottom: 17 },
  timerText: { color: colors.coral, fontWeight: "900" },
  redeemAmount: { fontSize: 24, fontWeight: "900", color: colors.ink, marginTop: 18 },
  retry: { color: colors.teal, fontWeight: "800", marginTop: 14 }
});
