import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getRazorpayCredentials } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { KEY_SECRET, mode } = getRazorpayCredentials();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required fields");
    }

    // Fetch the order amount to log correctly
    const { data: orderData } = await supabase
      .from("orders")
      .select("amount")
      .eq("order_id", razorpay_order_id)
      .maybeSingle();

    const amountPaise = orderData?.amount ?? 100;
    const amountINR = amountPaise / 100;
    const isPremium = amountINR >= 51;

    const expected = createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await supabase.from("payment_logs").insert({
        razorpay_payment_id,
        status: "failed",
        amount: amountINR,
        tier: isPremium ? "premium" : "standard",
      });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("verified_sessions")
      .select("payment_id, used")
      .eq("payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existing?.used) {
      return new Response(JSON.stringify({ error: "Payment already claimed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("orders").update({ status: "paid" }).eq("order_id", razorpay_order_id);

    await supabase.from("verified_sessions").upsert({
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      verified: true,
      used: existing?.used ?? false,
    });

    const { data: priorLog } = await supabase
      .from("payment_logs")
      .select("id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .eq("status", "success")
      .maybeSingle();

    if (!priorLog) {
      await supabase.from("payment_logs").insert({
        razorpay_payment_id,
        status: "success",
        amount: amountINR,
        tier: isPremium ? "premium" : "standard",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_token: razorpay_payment_id,
        mode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-payment error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
