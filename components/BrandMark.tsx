import { colors } from "@/constants/theme";
import { StyleProp, View, ViewStyle } from "react-native";

export function BrandMark({ size = 38, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: size, height: size, position: "relative" }, style]}>
      <View style={{ position: "absolute", width: size * 0.62, height: size * 0.28, borderRadius: size, backgroundColor: colors.mint, transform: [{ rotate: "-28deg" }], top: size * 0.17, left: 0 }} />
      <View style={{ position: "absolute", width: size * 0.62, height: size * 0.28, borderRadius: size, backgroundColor: colors.coral, transform: [{ rotate: "-28deg" }], bottom: size * 0.17, right: 0 }} />
    </View>
  );
}
