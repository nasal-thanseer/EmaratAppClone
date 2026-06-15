import { colors, radii } from "@/constants/theme";
import { RewardTransaction } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const iconMap = { earn: "arrow-down", redeem: "gift", bonus: "sparkles", adjustment: "options" } as const;

export function TransactionRow({ item }: { item: RewardTransaction }) {
  const positive = item.type !== "redeem";
  const displayedPoints = `${positive ? "+" : "-"}${Math.abs(item.points)}`;
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: positive ? colors.mintSoft : "#FDE8E4" }]}>
        <Ionicons name={iconMap[item.type]} size={19} color={positive ? colors.success : colors.coral} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.merchant?.name ?? item.description ?? "Nawa Rewards"}</Text>
        <Text style={styles.meta}>{new Date(item.created_at).toLocaleDateString()} · {item.type}</Text>
      </View>
      <View style={styles.end}>
        <Text style={[styles.points, { color: positive ? colors.success : colors.coral }]}>{displayedPoints}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomColor: colors.border, borderBottomWidth: 1 },
  icon: { width: 44, height: 44, borderRadius: radii.sm, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, marginLeft: 12 },
  name: { color: colors.text, fontWeight: "800", fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4, textTransform: "capitalize" },
  end: { alignItems: "flex-end" },
  points: { fontWeight: "900", fontSize: 16 },
  status: { color: colors.muted, fontSize: 11, marginTop: 3, textTransform: "capitalize" }
});
