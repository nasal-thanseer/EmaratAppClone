import { AuthShell, authStyles } from "@/components/AuthShell";
import { colors } from "@/constants/theme";
import { AuthCallbackDestination } from "@/lib/authRedirect";
import { requireSupabase } from "@/lib/supabase";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

const allowedDestinations = new Set<AuthCallbackDestination>(["/(tabs)", "/reset-password"]);

function getDestination(value: string | string[] | undefined): AuthCallbackDestination {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && allowedDestinations.has(candidate as AuthCallbackDestination)
    ? candidate as AuthCallbackDestination
    : "/(tabs)";
}

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    next?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;

    const authError = Array.isArray(params.error_description)
      ? params.error_description[0]
      : params.error_description;
    const code = Array.isArray(params.code) ? params.code[0] : params.code;

    if (authError || params.error) {
      setError(authError ?? "This authentication link is invalid or has expired.");
      return;
    }

    if (!code) {
      setError("This authentication link is invalid or has expired.");
      return;
    }
    const authorizationCode = code;

    async function finishAuthentication() {
      try {
        const { error: exchangeError } = await requireSupabase().auth.exchangeCodeForSession(authorizationCode);
        if (!active) return;
        if (exchangeError) {
          setError("This authentication link is invalid, expired, or was already used.");
          return;
        }
        router.replace(getDestination(params.next) as Href);
      } catch {
        if (active) setError("We could not complete authentication. Please request a new link.");
      }
    }

    void finishAuthentication();
    return () => {
      active = false;
    };
  }, [params.code, params.error, params.error_description, params.next]);

  return (
    <AuthShell title="Finishing sign in" subtitle="Securely confirming your Nawa account.">
      {error ? (
        <>
          <Text style={authStyles.error}>{error}</Text>
          <Pressable onPress={() => router.replace("/login")} style={authStyles.button}>
            <Text style={authStyles.buttonText}>Return to sign in</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color={colors.teal} size="large" />
      )}
    </AuthShell>
  );
}
