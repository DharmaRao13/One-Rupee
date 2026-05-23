import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getRazorpayCredentials } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { KEY_ID, KEY_SECRET, mode } = getRazorpayCredentials();
    const auth = btoa(`${KEY_ID}:${KEY_SECRET}`);

    // Parse optional amount from request body (in paise). Minimum is ₹1 = 100 paise.
    let amountPaise = 100; // default ₹1
    try {
      const body = await req.json();
      if (typeof body?.amount === "number" && body.amount >= 100) {
        amountPaise = Math.round(body.amount); // must be integer paise
      }
    } catch {
      // No body or invalid JSON — use default ₹1
    }

    const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `quest_${Date.now()}`,
        notes: { product: "rupee_quest_entry", mode, amount_inr: (amountPaise / 100).toFixed(2) },
      }),
    });

    if (!rzRes.ok) {
      const txt = await rzRes.text();
      throw new Error(`Razorpay order failed: ${txt}`);
    }

    const order = await rzRes.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await supabase.from("orders").insert({
      order_id: order.id,
      status: "pending",
      amount: amountPaise,
      currency: "INR",
    });

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: amountPaise,
        currency: "INR",
        key_id: KEY_ID,
        mode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-order error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
