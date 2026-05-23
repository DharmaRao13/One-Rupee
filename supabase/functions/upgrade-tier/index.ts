// Upgrades an existing user to premium after a verified ₹5 payment.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function verifyToken(token: string, secret: string): { paymentId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [paymentId, expiryStr, sig] = parts;
  const expiry = Number(expiryStr);
  if (!paymentId || !expiry || !sig) return null;
  if (Date.now() > expiry) return null;
  const expected = createHmac("sha256", secret).update(`${paymentId}.${expiry}`).digest("hex");
  if (expected !== sig) return null;
  return { paymentId };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Server misconfigured");

    const { payment_token, display_name } = await req.json();
    if (!payment_token || !display_name) throw new Error("Missing fields");

    const verified = verifyToken(payment_token, RAZORPAY_KEY_SECRET);
    if (!verified) throw new Error("Invalid or expired payment token");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: user } = await supabase
      .from("users_ledger")
      .select("id, badges")
      .eq("display_name", display_name)
      .maybeSingle();
    if (!user) throw new Error("User not found — please register first");

    const newBadges = new Set<string>(user.badges ?? []);
    newBadges.add("premium");

    const { error: updErr } = await supabase
      .from("users_ledger")
      .update({
        tier: "premium",
        tier_payment_id: verified.paymentId,
        badges: Array.from(newBadges),
      })
      .eq("id", user.id);
    if (updErr) throw new Error("Failed to upgrade");

    await supabase.from("payment_logs").insert({
      razorpay_payment_id: verified.paymentId,
      display_name,
      amount: 5,
      status: "success",
      tier: "premium",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("upgrade-tier error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
