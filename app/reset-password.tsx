import { AuthShell, authStyles } from "@/components/AuthShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput } from "react-native";

export default function ResetPasswordScreen() {
  const { session, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!session) return setError("This recovery link is invalid or has expired.");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true); setError("");
    try {
      await updatePassword(password);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use a strong password you do not reuse elsewhere.">
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      <TextInput secureTextEntry placeholder="New password" value={password} onChangeText={setPassword} style={authStyles.input} />
      <TextInput secureTextEntry placeholder="Confirm new password" value={confirm} onChangeText={setConfirm} style={authStyles.input} />
      <Pressable disabled={loading} onPress={submit} style={authStyles.button}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={authStyles.buttonText}>Update password</Text>}
      </Pressable>
    </AuthShell>
  );
}
