import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const genReferral = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function computeBadges(rank: number, referralCount: number, isPremium: boolean): string[] {
  const out: string[] = [];
  if (rank <= 10) out.push("og_10");
  if (rank <= 100) out.push("top_100");
  if (rank <= 500) out.push("top_500");
  if (referralCount >= 3) out.push("referrer_3");
  if (referralCount >= 10) out.push("referrer_10");
  if (isPremium) out.push("premium");
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { session_token, display_name, referred_by } = await req.json();
    if (!session_token || !display_name) throw new Error("Missing fields");

    const name = String(display_name).trim().slice(0, 30);
    if (name.length < 2) throw new Error("Display name must be at least 2 characters");

    const { data: sess, error: sessErr } = await supabase
      .from("verified_sessions")
      .select("*")
      .eq("payment_id", session_token)
      .maybeSingle();
    if (sessErr) throw sessErr;
    if (!sess || !sess.verified) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (sess.used) {
      return new Response(JSON.stringify({ error: "Session already used" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count: totalBefore } = await supabase
      .from("users_ledger")
      .select("*", { count: "exact", head: true });

    const rank = (totalBefore ?? 0) + 1;
    const referral_code = genReferral();

    const { data: user, error: userErr } = await supabase
      .from("users_ledger")
      .insert({
        display_name: name,
        razorpay_payment_id: session_token,
        payment_id: session_token,
        is_verified: true,
        amount_paid: 1,
        tier: "standard",
        referral_code,
        referred_by: referred_by || null,
        badges: computeBadges(rank, 0, false),
      })
      .select()
      .single();
    if (userErr) throw userErr;

    await supabase
      .from("verified_sessions")
      .update({ used: true, display_name: name })
      .eq("payment_id", session_token);

    await supabase.from("referral_stats").insert({
      user_id: user.id,
      display_name: name,
      referral_code,
      referral_count: 0,
    });

    return new Response(JSON.stringify({ success: true, user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("register-user error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
