/** Razorpay helpers — live vs test is determined by key prefix or RAZORPAY_MODE env. */

export type RazorpayMode = "live" | "test";

export function getRazorpayMode(keyId: string): RazorpayMode {
  const forced = Deno.env.get("RAZORPAY_MODE")?.toLowerCase();
  if (forced === "live" || forced === "test") return forced;
  return keyId.startsWith("rzp_live_") ? "live" : "test";
}

export function getRazorpayCredentials() {
  const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
  const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase secrets.");
  }
  const mode = getRazorpayMode(KEY_ID);
  if (mode === "live" && Deno.env.get("RAZORPAY_ALLOW_LIVE") !== "true") {
    console.warn(
      "Live Razorpay keys in use. Set RAZORPAY_ALLOW_LIVE=true in Supabase secrets after KYC review."
    );
  }
  return { KEY_ID, KEY_SECRET, mode };
}
