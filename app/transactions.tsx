import { ErrorState } from "@/components/AsyncState";
import { ProtectedScreen } from "@/components/ProtectedScreen";
import { Screen } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { TransactionRow } from "@/components/TransactionRow";
import { colors, radii } from "@/constants/theme";
import { getTransactions } from "@/services/rewards";
import { RewardTransaction } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function TransactionsRoute() {
  return <ProtectedScreen><TransactionsScreen /></ProtectedScreen>;
}

function TransactionsScreen() {
  const [items, setItems] = useState<RewardTransaction[] | null>(null);
  const [error, setError] = useState("");
  async function load() {
    setError("");
    try { setItems(await getTransactions()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Transactions unavailable."); }
  }
  useEffect(() => { void load(); }, []);
  return (
    <Screen header={<TopBar title="Transactions" back />}>
      <Text style={styles.heading}>Activity</Text>
      <Text style={styles.subtitle}>A server-verified record of points moving in and out.</Text>
      <View style={styles.card}>
        {!items && !error ? <ActivityIndicator color={colors.teal} style={{ margin: 30 }} /> : null}
        {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
        {items?.map((item) => <TransactionRow key={item.id} item={item} />)}
        {items?.length === 0 ? <View style={styles.empty}><Ionicons name="receipt-outline" size={38} color={colors.muted} /><Text style={styles.emptyTitle}>No activity yet</Text><Text style={styles.emptyText}>Your first verified earn or redemption will appear here.</Text></View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.ink, fontSize: 29, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.muted, lineHeight: 20, marginTop: 5, marginBottom: 22 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: 17 },
  empty: { alignItems: "center", paddingVertical: 50 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyText: { color: colors.muted, textAlign: "center", fontSize: 12, maxWidth: 220, lineHeight: 18, marginTop: 6 }
});
