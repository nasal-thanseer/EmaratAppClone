import { LoadingState } from "@/components/AsyncState";
import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";
import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProtectedScreen({ children }: PropsWithChildren) {
  const { session, loading } = useAuth();
  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}><LoadingState label="Restoring your secure session..." /></SafeAreaView>;
  }
  if (!session) return <Redirect href="/login" />;
  return children;
}
