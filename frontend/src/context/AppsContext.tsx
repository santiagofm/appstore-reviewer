import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getTrackedApps,
  removeApp as apiRemoveApp,
  type TrackedApp,
} from "../api";

interface AppsContextValue {
  apps: TrackedApp[];
  loading: boolean;
  refresh: () => Promise<void>;
  remove: (appId: string) => Promise<void>;
}

const AppsContext = createContext<AppsContextValue | null>(null);

export function AppsProvider({ children }: { children: React.ReactNode }) {
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getTrackedApps();
      setApps(data);
    } catch {
      // keep stale list on error
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (appId: string) => {
    await apiRemoveApp(appId);
    setApps((prev) => prev.filter((a) => a.app_id !== appId));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return (
    <AppsContext.Provider value={{ apps, loading, refresh, remove }}>
      {children}
    </AppsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApps(): AppsContextValue {
  const ctx = useContext(AppsContext);
  if (!ctx) throw new Error("useApps must be used within AppsProvider");
  return ctx;
}
