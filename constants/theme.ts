export const colors = {
  ink: "#132F38",
  teal: "#0D5960",
  tealDark: "#083C42",
  mint: "#31B79A",
  mintSoft: "#DDF4EC",
  coral: "#F47862",
  sand: "#DDBE82",
  cream: "#F7F4EC",
  white: "#FFFFFF",
  text: "#19343C",
  muted: "#71848A",
  border: "#E3E8E5",
  error: "#C84A4A",
  warning: "#BE7A20",
  success: "#19856C"
};

export const radii = { sm: 12, md: 18, lg: 26, xl: 34 };
export const shadow: ViewStyle = Platform.select({
  web: { boxShadow: "0 8px 18px rgba(22, 55, 62, 0.09)" },
  default: {
    shadowColor: "#16373E",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  }
}) as ViewStyle;
import { Platform, ViewStyle } from "react-native";
