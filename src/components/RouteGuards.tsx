import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getSS, SS, clearFlow } from "@/lib/session";
import { fetchVerifiedSession } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import QuestLoader from "@/components/QuestLoader";

type GuardState = "checking" | "ok" | "deny";

function useSessionGuard(requireRegistered = false): GuardState {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    if (loading) return;
    if (isAdmin) { setState("ok"); return; }

    let cancelled = false;
    (async () => {
      const token = getSS(SS.sessionToken);
      if (!token) {
        if (!cancelled) { setState("deny"); toast.error("Pay ₹1 to unlock"); nav("/", { replace: true }); }
        return;
      }
      try {
        const sess = await fetchVerifiedSession(token);
        if (cancelled) return;
        if (!sess || !sess.verified) { clearFlow(); setState("deny"); toast.error("Session invalid"); nav("/", { replace: true }); return; }
        if (requireRegistered && !sess.used) { setState("deny"); nav("/register", { replace: true }); return; }
        setState("ok");
      } catch {
        if (!cancelled) { setState("deny"); toast.error("Session check failed"); nav("/", { replace: true }); }
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin, loading, nav, requireRegistered]);

  return state;
}

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (!loading && !session) nav(`/auth?next=${encodeURIComponent(loc.pathname)}`, { replace: true });
  }, [loading, session, nav, loc.pathname]);
  if (loading || !session) return <QuestLoader label="Checking login…" />;
  return <>{children}</>;
};

export const RequirePayment = ({ children }: { children: React.ReactNode }) => {
  const s = useSessionGuard(false);
  if (s === "checking") return <QuestLoader label="Verifying payment…" />;
  if (s !== "ok") return null;
  return <>{children}</>;
};

export const RequireRegistered = ({ children }: { children: React.ReactNode }) => {
  const s = useSessionGuard(true);
  if (s === "checking") return <QuestLoader label="Opening the wall…" />;
  if (s !== "ok") return null;
  return <>{children}</>;
};
