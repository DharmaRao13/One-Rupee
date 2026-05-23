// Session-storage gate keys.
// NOTE: sessionStorage is a hint only — every protected page re-validates the
// session_token against verified_sessions in the database.
export const SS = {
  sessionToken: "session_token",          // payment_id from verified_sessions
  paymentVerified: "payment_verified",    // legacy; kept for compatibility
  userRegistered: "user_registered",
  displayName: "display_name",
  referredByCode: "referred_by_code",
  referralCode: "referral_code",
  isPremium: "is_premium",
  userRank: "user_rank",
  funnelSessionId: "funnel_session_id",
} as const;

export const getSS = (k: string) =>
  typeof window === "undefined" ? null : window.sessionStorage.getItem(k);

export const setSS = (k: string, v: string) => window.sessionStorage.setItem(k, v);

export const clearFlow = () => {
  [
    SS.sessionToken,
    SS.paymentVerified,
    SS.userRegistered,
    SS.displayName,
    SS.referralCode,
    SS.isPremium,
    SS.userRank,
  ].forEach((k) => window.sessionStorage.removeItem(k));
};
