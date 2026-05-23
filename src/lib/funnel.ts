import { supabase } from "@/integrations/supabase/client";
import { getSS, setSS, SS } from "@/lib/session";

export type FunnelStep =
  | "home_view"
  | "pay_view"
  | "pay_initiated"
  | "pay_success"
  | "pay_failed"
  | "register_view"
  | "register_success"
  | "leaderboard_view"
  | "upgrade_view";

export function getSessionId(): string {
  let id = getSS(SS.funnelSessionId);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setSS(SS.funnelSessionId, id);
  }
  return id;
}

export async function trackStep(step: FunnelStep, extra: { tier?: string } = {}) {
  try {
    await supabase.from("funnel_events").insert({
      step,
      session_id: getSessionId(),
      referral_code: getSS(SS.referredByCode),
      tier: extra.tier ?? null,
    });
  } catch (e) {
    // analytics is best-effort
    console.warn("trackStep failed", e);
  }
}
