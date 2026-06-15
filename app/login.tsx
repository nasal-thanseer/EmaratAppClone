import { AuthShell, authStyles } from "@/components/AuthShell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput } from "react-native";

export default function LoginScreen() {
  const { signIn, isDemo, configurationError } = useAuth();
  const [email, setEmail] = useState(isDemo ? "demo@nawa.app" : "");
  const [password, setPassword] = useState(isDemo ? "demo1234" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (configurationError) return setError(configurationError);
    if (!email.includes("@") || password.length < 6) return setError("Enter a valid email and a password of at least 6 characters.");
    setLoading(true); setError("");
    try { await signIn(email.trim(), password); router.replace("/(tabs)"); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in."); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell title="Welcome back" subtitle={isDemo ? "Demo mode is active. Sign in to explore the complete MVP." : "Sign in to see your points and rewards."}>
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      {!error && configurationError ? <Text style={authStyles.error}>{configurationError}</Text> : null}
      <TextInput accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" placeholder="Email address" value={email} onChangeText={setEmail} style={authStyles.input} />
      <TextInput accessibilityLabel="Password" secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} style={authStyles.input} />
      <Pressable onPress={() => router.push("/forgot-password")}><Text style={[authStyles.link, { textAlign: "right", marginBottom: 14 }]}>Forgot password?</Text></Pressable>
      <Pressable disabled={loading || Boolean(configurationError)} onPress={submit} style={[authStyles.button, configurationError && { opacity: 0.5 }]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={authStyles.buttonText}>Sign in</Text>}</Pressable>
      <Text style={authStyles.helper}>New to Nawa? <Text style={authStyles.link} onPress={() => router.push("/register")}>Create account</Text></Text>
    </AuthShell>
  );
}
