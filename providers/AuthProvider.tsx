import { toAppError } from "@/lib/errors";
import { configurationError, isDemoMode, requireSupabase, supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { Href, router } from "expo-router";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  configurationError: string | null;
  isMerchant: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(fullName: string, email: string, password: string): Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [demoSignedIn, setDemoSignedIn] = useState(isDemoMode);
  const [hasMerchantAssignment, setHasMerchantAssignment] = useState(isDemoMode);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    async function updateMerchantAccess(nextSession: Session | null) {
      if (!nextSession) {
        if (mounted) setHasMerchantAssignment(false);
        return;
      }
      const { data, error } = await supabase!
        .from("merchant_staff")
        .select("merchant_id")
        .limit(1);
      if (!mounted) return;
      setHasMerchantAssignment(!error && Boolean(data?.length));
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error && __DEV__) console.warn("Session restore failed", error.message);
      setSession(data.session);
      setLoading(false);
      void updateMerchantAccess(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        void updateMerchantAccess(nextSession);
      }
      if (event === "PASSWORD_RECOVERY") router.replace("/reset-password" as Href);
    });

    async function handleDeepLink(url: string | null) {
      if (!url) return;
      const parsed = Linking.parse(url);
      const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
      if (code) {
        const { error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error && __DEV__) console.warn("Auth callback failed", error.message);
      }
    }
    void Linking.getInitialURL().then(handleDeepLink);
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => { void handleDeepLink(url); });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      setDemoSignedIn(true);
      return;
    }
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      throw toAppError(error, "Unable to sign in.");
    }
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (isDemoMode) {
      setDemoSignedIn(true);
      return { needsEmailConfirmation: false };
    }
    try {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: Linking.createURL("/login")
        }
      });
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    } catch (error) {
      throw toAppError(error, "Unable to create the account.");
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (isDemoMode) return;
    try {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: Linking.createURL("/reset-password")
      });
      if (error) throw error;
    } catch (error) {
      throw toAppError(error, "Unable to request password recovery.");
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (isDemoMode) return;
    try {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      throw toAppError(error, "Unable to update the password.");
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setDemoSignedIn(false);
      setSession(null);
      return;
    }
    try {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error) {
      throw toAppError(error, "Unable to sign out.");
    }
  }, []);

  const demoSession = demoSignedIn && isDemoMode
    ? ({ user: { id: "demo-user", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: new Date(0).toISOString() } } as Session)
    : null;
  const currentSession = demoSession ?? session;

  const value = useMemo<AuthContextValue>(() => ({
    session: currentSession,
    loading,
    isDemo: isDemoMode,
    configurationError,
    isMerchant: isDemoMode || hasMerchantAssignment,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut
  }), [currentSession, hasMerchantAssignment, loading, signIn, signOut, signUp, resetPassword, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
