import { AuthShell, authStyles } from "@/components/AuthShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput } from "react-native";

export default function RegisterScreen() {
  const { signUp, configurationError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (configurationError) return setError(configurationError);
    if (name.trim().length < 2 || !email.includes("@") || password.length < 8) return setError("Use your full name, a valid email, and at least 8 password characters.");
    setLoading(true); setError("");
    try {
      const result = await signUp(name.trim(), email.trim(), password);
      if (result.needsEmailConfirmation) setNotice("Account created. Use the confirmation link in your email to finish signing in.");
      else router.replace("/(tabs)");
    }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to create account."); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell title="Join Nawa" subtitle="One account for everyday rewards across our partner community.">
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      {notice ? <Text style={{ color: colors.success, lineHeight: 20, marginBottom: 12 }}>{notice}</Text> : null}
      <TextInput placeholder="Full name" value={name} onChangeText={setName} style={authStyles.input} />
      <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email address" value={email} onChangeText={setEmail} style={authStyles.input} />
      <TextInput secureTextEntry placeholder="Password (8+ characters)" value={password} onChangeText={setPassword} style={authStyles.input} />
      <Pressable disabled={loading || Boolean(configurationError)} onPress={submit} style={[authStyles.button, configurationError && { opacity: 0.5 }]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={authStyles.buttonText}>Create account</Text>}</Pressable>
      <Text style={authStyles.helper}>Already a member? <Text style={authStyles.link} onPress={() => router.back()}>Sign in</Text></Text>
    </AuthShell>
  );
}
