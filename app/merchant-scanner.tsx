import { ErrorState, LoadingState } from "@/components/AsyncState";
import { ProtectedScreen } from "@/components/ProtectedScreen";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useConnectivity } from "@/providers/ConnectivityProvider";
import { earnPoints, getMerchantContexts, redeemToken } from "@/services/rewards";
import { MerchantContext } from "@/types/database";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MerchantScannerRoute() {
  return <ProtectedScreen><MerchantScannerScreen /></ProtectedScreen>;
}

function MerchantScannerScreen() {
  const { isMerchant, isDemo } = useAuth();
  const { isOnline } = useConnectivity();
  const [permission, requestPermission] = useCameraPermissions();
  const [merchants, setMerchants] = useState<MerchantContext[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState("");
  const [payload, setPayload] = useState("");
  const [amount, setAmount] = useState("");
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isMerchant && !isDemo) {
      setContextLoading(false);
      setContextError("This screen requires an authorized merchant account.");
      return;
    }
    getMerchantContexts()
      .then((assignments) => {
        setMerchants(assignments);
        setSelectedMerchantId(assignments[0]?.merchant_id ?? "");
      })
      .catch((cause) => setContextError(cause instanceof Error ? cause.message : "Merchant assignment unavailable."))
      .finally(() => setContextLoading(false));
  }, [isDemo, isMerchant]);

  const merchant = merchants.find((item) => item.merchant_id === selectedMerchantId) ?? null;

  async function process() {
    if (!payload || !merchant || !isOnline) return;
    setLoading(true); setResult("");
    try {
      if (payload.startsWith("nawa:redeem:")) {
        const response = await redeemToken(payload.replace("nawa:redeem:", ""), merchant.merchant_id);
        if (response.status === "success") setResult(`Redemption completed${response.points ? ` for ${response.points} points` : ""}.`);
        else if (response.status === "already_processed") setResult("This scan was already processed.");
        else if (response.status === "already_used") setResult("This redemption code was already used.");
        else if (response.status === "expired") setResult("This redemption code has expired.");
        else if (response.status === "insufficient_points") setResult("The member no longer has enough points.");
        else setResult("The redemption code is invalid.");
      } else {
        const purchase = Number(amount);
        if (!(purchase > 0)) throw new Error("Enter the verified purchase amount.");
        const response = await earnPoints(payload, merchant.merchant_id, purchase);
        setResult(response.status === "already_processed"
          ? "This purchase was already processed."
          : `${response.points ?? 0} points awarded successfully.`);
      }
    } catch (e) { setResult(e instanceof Error ? e.message : "Scan could not be processed."); }
    finally { setLoading(false); }
  }

  if (contextLoading) return <Screen header={<TopBar title="Merchant scanner" back />}><LoadingState label="Verifying merchant access..." /></Screen>;
  if (contextError || !merchant) return <Screen header={<TopBar title="Merchant scanner" back />}><ErrorState message={contextError || "Merchant access unavailable."} /></Screen>;
  return (
    <Screen header={<TopBar title="Merchant scanner" back />} scroll>
      <View style={styles.restricted}><Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} /><Text style={styles.restrictedText}>Authorized as {merchant.role} for {merchant.merchant_name}. Supabase verifies this assignment again inside every RPC.</Text></View>
      {merchants.length > 1 ? (
        <View style={styles.merchantList}>
          {merchants.map((item) => (
            <Pressable key={item.merchant_id} onPress={() => setSelectedMerchantId(item.merchant_id)} style={[styles.merchantOption, item.merchant_id === selectedMerchantId && styles.merchantOptionActive]}>
              <Text style={[styles.merchantOptionText, item.merchant_id === selectedMerchantId && styles.merchantOptionTextActive]}>{item.merchant_name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.cameraWrap}>
        {!permission?.granted ? (
          <View style={styles.permission}><Ionicons name="camera-outline" size={38} color={colors.teal} /><Text style={styles.permissionTitle}>Camera access needed</Text><Pressable onPress={requestPermission} style={styles.smallButton}><Text style={styles.smallButtonText}>Allow camera</Text></Pressable></View>
        ) : (
          <CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={locked ? undefined : ({ data }) => { setPayload(data); setLocked(true); }} />
        )}
        <View style={[styles.scanFrame, { pointerEvents: "none" }]} />
      </View>
      <Pressable onPress={() => { setLocked(false); setPayload(""); setResult(""); }}><Text style={styles.rescan}>Scan another code</Text></Pressable>
      <Text style={styles.label}>Scanned payload</Text>
      <TextInput value={payload} onChangeText={(value) => { setPayload(value); setResult(""); }} editable={isDemo} placeholder={isDemo ? "Scan or paste a demo payload" : "Scan a QR code"} autoCapitalize="none" style={styles.input} />
      {payload && !payload.startsWith("nawa:redeem:") ? <><Text style={styles.label}>Purchase amount (AED)</Text><TextInput value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" style={styles.input} /></> : null}
      {result ? <View style={styles.result}><Text style={styles.resultText}>{result}</Text></View> : null}
      <Pressable onPress={process} disabled={!payload || loading || !isOnline} style={[styles.button, (!payload || loading || !isOnline) && { opacity: .45 }]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{isOnline ? "Validate with server" : "Unavailable offline"}</Text>}</Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  restricted: { flexDirection: "row", gap: 9, backgroundColor: "#FFF4DC", padding: 14, borderRadius: radii.md, marginBottom: 16 },
  restrictedText: { color: "#795015", flex: 1, fontSize: 11, lineHeight: 17 },
  merchantList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  merchantOption: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  merchantOptionActive: { borderColor: colors.teal, backgroundColor: colors.mintSoft },
  merchantOptionText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  merchantOptionTextActive: { color: colors.teal },
  cameraWrap: { height: 285, borderRadius: radii.lg, overflow: "hidden", backgroundColor: "#DDE5E3", alignItems: "center", justifyContent: "center" },
  permission: { alignItems: "center" },
  permissionTitle: { color: colors.ink, fontWeight: "900", marginVertical: 10 },
  smallButton: { backgroundColor: colors.teal, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  smallButtonText: { color: colors.white, fontWeight: "800", fontSize: 12 },
  scanFrame: { position: "absolute", width: 190, height: 190, borderWidth: 3, borderColor: colors.mint, borderRadius: 24 },
  rescan: { textAlign: "center", color: colors.teal, fontWeight: "800", marginVertical: 14 },
  label: { color: colors.text, fontSize: 12, fontWeight: "800", marginBottom: 7, marginTop: 5 },
  input: { backgroundColor: colors.white, height: 52, borderRadius: radii.sm, paddingHorizontal: 14, color: colors.text, marginBottom: 12 },
  result: { backgroundColor: colors.mintSoft, padding: 13, borderRadius: radii.sm },
  resultText: { color: colors.success, fontWeight: "700", fontSize: 12 },
  button: { height: 54, backgroundColor: colors.coral, borderRadius: radii.sm, alignItems: "center", justifyContent: "center", marginTop: 15 },
  buttonText: { color: colors.white, fontWeight: "900" }
});
