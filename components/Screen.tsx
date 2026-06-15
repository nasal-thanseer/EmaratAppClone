import { colors } from "@/constants/theme";
import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children, scroll = true, header }: PropsWithChildren<{ scroll?: boolean; header?: ReactNode }>) {
  const body = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {header}
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 120 },
  content: { flexGrow: 1, paddingHorizontal: 20 }
});
