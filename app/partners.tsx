import { ErrorState } from "@/components/AsyncState";
import { ProtectedScreen } from "@/components/ProtectedScreen";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { colors, radii } from "@/constants/theme";
import { getMerchants } from "@/services/rewards";
import { Merchant } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

export default function PartnersRoute() {
  return <ProtectedScreen><PartnersScreen /></ProtectedScreen>;
}

function PartnersScreen() {
  const [items, setItems] = useState<Merchant[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  async function load() {
    setError("");
    try { setItems(await getMerchants()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Partners unavailable."); }
  }
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => items?.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return (
    <Screen header={<TopBar title="Partners" back />}>
      <Text style={styles.heading}>Explore nearby rewards</Text>
      <View style={styles.search}><Ionicons name="search" size={19} color={colors.muted} /><TextInput placeholder="Search name or category" value={query} onChangeText={setQuery} style={styles.input} /></View>
      {!items && !error ? <ActivityIndicator color={colors.teal} style={{ marginTop: 30 }} /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {filtered?.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <View style={[styles.logo, { backgroundColor: index % 2 ? "#FDE8E4" : colors.mintSoft }]}><Ionicons name={index % 2 ? "restaurant-outline" : "storefront-outline"} size={24} color={index % 2 ? colors.coral : colors.teal} /></View>
          <View style={{ flex: 1 }}><Text style={styles.name}>{item.name}</Text><Text style={styles.category}>{item.category}</Text><Text style={styles.rate}>{item.earn_rate} points / AED</Text></View>
          <View style={[styles.badge, !item.redeem_enabled && styles.badgeOff]}><Text style={[styles.badgeText, !item.redeem_enabled && styles.badgeTextOff]}>{item.redeem_enabled ? "Redeem" : "Earn only"}</Text></View>
        </View>
      ))}
      {filtered?.length === 0 && <Text style={styles.empty}>No partners match that search.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.ink, fontSize: 26, fontWeight: "900", marginTop: 8, marginBottom: 18 },
  search: { height: 52, backgroundColor: colors.white, borderRadius: radii.sm, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 15 },
  input: { flex: 1, marginLeft: 9, color: colors.text },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderRadius: radii.md, padding: 15, marginBottom: 11 },
  logo: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 13 },
  name: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  category: { color: colors.muted, fontSize: 11, marginTop: 2 },
  rate: { color: colors.teal, fontWeight: "800", fontSize: 12, marginTop: 6 },
  badge: { backgroundColor: colors.mintSoft, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6 },
  badgeOff: { backgroundColor: "#EEEFEA" },
  badgeText: { color: colors.success, fontSize: 9, fontWeight: "900" },
  badgeTextOff: { color: colors.muted },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 }
});
