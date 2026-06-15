import { colors, radii } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange(value: T): void }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => (
        <Pressable key={option} onPress={() => onChange(option)} style={[styles.option, value === option && styles.active]}>
          <Text style={[styles.text, value === option && styles.activeText]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: "#E9ECE6", borderRadius: radii.md, padding: 4 },
  option: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 14 },
  active: { backgroundColor: colors.white },
  text: { color: colors.muted, fontWeight: "700", textTransform: "capitalize" },
  activeText: { color: colors.teal }
});
