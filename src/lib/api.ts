import { supabase } from "@/integrations/supabase/client";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function callFn<T>(name: string, body?: unknown): Promise<T> {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export type RazorpayMode = "live" | "test";

export const createOrder = (amountPaise = 100) =>
  callFn<{ order_id: string; amount: number; currency: string; key_id: string; mode: RazorpayMode }>(
    "create-order",
    { amount: amountPaise }
  );

export const verifyPayment = (p: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => callFn<{ success: true; session_token: string; mode?: RazorpayMode }>("verify-payment", p);

export const registerUser = (session_token: string, display_name: string, referred_by?: string | null) =>
  callFn<{ success: true; user: { id: string; display_name: string; created_at: string; referral_code: string } }>(
    "register-user",
    { session_token, display_name, referred_by: referred_by ?? null }
  );

export const upgradeTier = (payment_token: string, display_name: string) =>
  callFn<{ success: true }>("upgrade-tier", { payment_token, display_name });

/** DB-side session validation — never trust sessionStorage alone */
export const fetchVerifiedSession = async (token: string) => {
  const { data, error } = await supabase
    .from("verified_sessions")
    .select("payment_id, verified, used, display_name")
    .eq("payment_id", token)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export interface LedgerRow {
  id: string;
  display_name: string;
  created_at: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  payment_id?: string | null;
  notes?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  referral_count?: number;
  badges?: string[];
  tier?: string;
  amount_paid?: number;
}

export const fetchLedger = async (): Promise<LedgerRow[]> => {
  const { data, error } = await supabase
    .from("users_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as LedgerRow[];
};

export const fetchTotalPayers = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("site_stats")
    .select("total_payers")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.total_payers ?? 0;
};

export interface SiteStats {
  total_payers: number;
  leaderboard_enabled: boolean;
  payment_enabled: boolean;
}

export const fetchSiteStats = async (): Promise<SiteStats> => {
  const { data, error } = await supabase
    .from("site_stats")
    .select("total_payers, leaderboard_enabled, payment_enabled")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? { total_payers: 0, leaderboard_enabled: true, payment_enabled: true }) as SiteStats;
};
