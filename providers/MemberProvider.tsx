import { DEMO_MEMBER } from "@/constants/mockData";
import { toAppError } from "@/lib/errors";
import { useAuth } from "@/providers/AuthProvider";
import { useConnectivity } from "@/providers/ConnectivityProvider";
import { getMemberSnapshot } from "@/services/rewards";
import { MemberSnapshot } from "@/types/database";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface MemberContextValue {
  member: MemberSnapshot | null;
  loading: boolean;
  error: string;
  refresh(): Promise<void>;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: PropsWithChildren) {
  const { session, isDemo } = useAuth();
  const { isOnline } = useConnectivity();
  const userId = session?.user.id;
  const [member, setMember] = useState<MemberSnapshot | null>(isDemo ? DEMO_MEMBER : null);
  const [loading, setLoading] = useState(Boolean(session) && !isDemo);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!userId) {
      setMember(null);
      return;
    }
    if (isDemo) {
      setMember(DEMO_MEMBER);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setMember(await getMemberSnapshot());
    } catch (cause) {
      setError(toAppError(cause, "Unable to load your membership.").message);
    } finally {
      setLoading(false);
    }
  }, [isDemo, userId]);

  useEffect(() => {
    if (isOnline) void refresh();
  }, [isOnline, refresh]);
  const value = useMemo(() => ({ member, loading, error, refresh }), [member, loading, error, refresh]);
  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useMember must be used inside MemberProvider");
  return context;
}
