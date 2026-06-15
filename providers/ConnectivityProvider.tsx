import NetInfo from "@react-native-community/netinfo";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

interface ConnectivityContextValue {
  isOnline: boolean;
  isChecking: boolean;
}

const ConnectivityContext = createContext<ConnectivityContextValue>({ isOnline: true, isChecking: true });

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
      setIsChecking(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ isOnline, isChecking }), [isOnline, isChecking]);
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
