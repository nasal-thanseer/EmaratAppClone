import { AuthShell, authStyles } from "@/components/AuthShell";
import { Pressable, Text, TextInput } from "react-native";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword, configurationError } = useAuth();
  async function submit() {
    if (configurationError) return setError(configurationError);
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setLoading(true); setError("");
    try { await resetPassword(email.trim()); setSent(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to request recovery."); }
    finally { setLoading(false); }
  }
  return (
    <AuthShell title="Reset password" subtitle="We will send recovery instructions to your registered email.">
      {sent ? <Text style={{ color: "#19856C", lineHeight: 22 }}>Recovery instructions requested. Check your inbox and spam folder.</Text> : (
        <>
          <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email address" value={email} onChangeText={setEmail} style={authStyles.input} />
          {error ? <Text style={authStyles.error}>{error}</Text> : null}
          <Pressable disabled={loading || Boolean(configurationError)} onPress={submit} style={[authStyles.button, configurationError && { opacity: 0.5 }]}><Text style={authStyles.buttonText}>{loading ? "Sending..." : "Send instructions"}</Text></Pressable>
        </>
      )}
    </AuthShell>
  );
}
