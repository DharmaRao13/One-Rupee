import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

/** Backwards-compat shim — existing code imports this. */
export const useIsAdmin = () => {
  const { isAdmin, loading } = useAuth();
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => { if (!loading) setV(isAdmin); }, [isAdmin, loading]);
  return v;
};
