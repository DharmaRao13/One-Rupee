import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, ShieldCheck, CreditCard, Sparkles, AlertCircle, Heart, Zap, IndianRupee, Gift } from "lucide-react";
import { toast } from "sonner";
import { createOrder, verifyPayment, fetchSiteStats, type RazorpayMode } from "@/lib/api";
import { ensureRazorpayLoaded, openRazorpay } from "@/lib/razorpay";
import { setSS, SS } from "@/lib/session";
import { trackStep } from "@/lib/funnel";
import StepProgress from "@/components/StepProgress";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import { useSound } from "@/lib/sound";
import { useAuth } from "@/lib/auth";

type State = "idle" | "creating" | "opening" | "verifying" | "success" | "error";

const stateMeta: Record<Exclude<State, "idle">, { icon: typeof Loader2; text: string }> = {
  creating:  { icon: Loader2,     text: "Summoning your order…" },
  opening:   { icon: CreditCard,  text: "Opening payment portal…" },
  verifying: { icon: ShieldCheck, text: "Verifying with the owl…" },
  success:   { icon: Sparkles,    text: "Quest complete! +100 XP" },
  error:     { icon: AlertCircle, text: "Quest failed — try again" },
};

/** Quick-select preset amounts in ₹ */
const PRESETS = [1, 5, 10, 21, 51, 101];

const burst = () => {
  const colors = ["#58CC02", "#FFC800", "#1CB0F6", "#FF4B4B"];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors }), 150);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors }), 300);
};

const PayPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { play } = useSound();
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [state, setState] = useState<State>("idle");
  const [levelUp, setLevelUp] = useState(false);
  const [payMode, setPayMode] = useState<RazorpayMode | null>(null);

  // Amount selection
  const [selectedRupees, setSelectedRupees] = useState<number>(1);   // ₹ integer
  const [customInput, setCustomInput] = useState("");                  // raw text in custom field
  const [isCustom, setIsCustom] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackStep("pay_view");
    fetchSiteStats().then((s) => setPaymentEnabled(s.payment_enabled));
    const envMode = import.meta.env.VITE_RAZORPAY_MODE as RazorpayMode | undefined;
    if (envMode === "live" || envMode === "test") setPayMode(envMode);
  }, []);

  // Derive the final rupee amount (1 minimum)
  const finalRupees = isCustom
    ? Math.max(1, Math.floor(Number(customInput) || 1))
    : selectedRupees;
  const finalPaise = finalRupees * 100;

  const handlePreset = (amt: number) => {
    setIsCustom(false);
    setSelectedRupees(amt);
    setCustomInput("");
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setTimeout(() => customRef.current?.focus(), 50);
  };

  const handleCustomChange = (v: string) => {
    // allow only non-negative integers
    const cleaned = v.replace(/[^0-9]/g, "");
    setCustomInput(cleaned);
  };

  const reset = () => setState("idle");

  const startPayment = async () => {
    if (state !== "idle" && state !== "error") return;
    if (finalRupees < 1) { toast.error("Minimum payment is ₹1"); return; }

    setState("creating");
    try {
      const ok = await ensureRazorpayLoaded();
      if (!ok) throw new Error("Could not load payment SDK");

      const order = await createOrder(finalPaise);
      setPayMode(order.mode ?? (order.key_id.startsWith("rzp_live_") ? "live" : "test"));
      await trackStep("pay_initiated");
      setState("opening");

      openRazorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "The ₹1 Quest",
        description: finalRupees === 1 ? "Join the wall — ₹1" : `Support the quest — ₹${finalRupees}`,
        order_id: order.order_id,
        theme: { color: "#58CC02" },
        prefill: {},
        modal: {
          ondismiss: () => {
            toast.error("Quest cancelled");
            reset();
          },
        },
        handler: async (response) => {
          setState("verifying");
          try {
            const v = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSS(SS.sessionToken, v.session_token);
            setSS(SS.paymentVerified, "true");
            await trackStep("pay_success", { tier: "standard", amount_inr: finalRupees });
            setState("success");
            burst();
            play("level_up");
            setLevelUp(true);
            setTimeout(() => navigate("/register", { replace: true }), 3200);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            toast.error(msg);
            play("error");
            setState("error");
          }
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start payment";
      toast.error(msg);
      setState("error");
    }
  };

  if (!paymentEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background-soft text-foreground">
        <div className="duo-card max-w-md text-center">
          <div className="text-6xl mb-3">🏁</div>
          <h1 className="font-display text-2xl">Quest closed.</h1>
          <p className="mt-2 text-muted-foreground">Thanks for playing!</p>
          <button onClick={() => navigate("/")} className="mt-6 duo-btn duo-btn-ghost w-full">← Back home</button>
        </div>
      </div>
    );
  }

  const busy = state !== "idle" && state !== "error";
  const meta = state === "idle" ? null : stateMeta[state];
  const Icon = meta?.icon;
  const stepIdx = state === "success" ? 2 : busy ? 1 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 pb-32 bg-background-soft text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="duo-card w-full max-w-md"
      >
        <StepProgress steps={["Decide", "Pay", "Join"]} current={stepIdx} />

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <Heart key={i} className="h-5 w-5 fill-destructive text-destructive" />
          ))}
        </div>

        <h1 className="mt-6 text-2xl md:text-3xl font-display text-center leading-tight">
          One quest stands between you<br /> and <span className="text-primary">the wall</span>.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground text-center">
          Minimum ₹1. Pay more to show extra love 🦉 Secured by Razorpay {payMode === "live" ? "Live" : "Checkout"}.
        </p>
        {payMode === "live" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 mx-auto w-fit duo-chip bg-gold/20 text-gold border border-gold/40"
          >
            🔒 Live payments enabled
          </motion.div>
        )}

        {/* ── Amount picker ── */}
        <div className="mt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">
            Choose your contribution
          </p>

          {/* Preset grid */}
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((amt) => {
              const active = !isCustom && selectedRupees === amt;
              return (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePreset(amt)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 py-3 font-display transition-all duration-150 ${
                    active
                      ? "border-primary bg-primary/15 text-primary border-b-4 shadow-[0_4px_0_0_hsl(var(--primary-shadow))]"
                      : "border-border bg-background-soft text-foreground hover:border-primary/40"
                  }`}
                >
                  {amt === 1 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Min
                    </span>
                  )}
                  <span className="text-lg leading-none">₹{amt}</span>
                  {amt >= 51 && (
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      {amt === 51 ? "Lucky 🍀" : amt === 101 ? "Legend 🏆" : ""}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom amount row */}
          <motion.div
            onClick={handleCustomFocus}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 cursor-text transition-all duration-150 ${
              isCustom
                ? "border-accent bg-accent/10 shadow-[0_0_0_3px_hsl(var(--accent)/0.15)]"
                : "border-border bg-background-soft"
            }`}
          >
            <Gift className={`h-5 w-5 shrink-0 ${isCustom ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-sm font-bold ${isCustom ? "text-accent" : "text-muted-foreground"}`}>
              Custom amount
            </span>
            <div className="ml-auto flex items-center gap-1">
              <IndianRupee className={`h-4 w-4 ${isCustom ? "text-accent" : "text-muted-foreground"}`} />
              <input
                ref={customRef}
                type="number"
                min={1}
                value={customInput}
                onChange={(e) => handleCustomChange(e.target.value)}
                onFocus={() => setIsCustom(true)}
                placeholder="0"
                className="w-20 bg-transparent text-right font-display text-lg outline-none text-foreground"
              />
            </div>
          </motion.div>
        </div>

        {/* Summary row */}
        <AnimatePresence mode="wait">
          <motion.div
            key={finalRupees}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-2xl bg-background-soft border-2 p-4 space-y-2 text-sm font-bold"
          >
            <Row k="Amount" v={
              <span className="text-primary text-base">₹{finalRupees}.00</span>
            } />
            <Row k="Method" v="UPI · Card · Wallet" />
            <Row k="XP reward" v={
              <span className="text-gold">
                +{finalRupees >= 51 ? "250" : finalRupees >= 11 ? "150" : "100"} XP ⚡
              </span>
            } />
          </motion.div>
        </AnimatePresence>

        {/* Pay button */}
        <motion.button
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.97 } : {}}
          onClick={() => { play("click"); startPayment(); }}
          disabled={busy}
          className="mt-6 w-full duo-btn duo-btn-primary text-base py-4"
        >
          <Zap className="h-5 w-5" />
          {busy ? "PROCESSING…" : state === "error" ? "TRY AGAIN" : `PAY ₹${finalRupees} NOW`}
        </motion.button>

        {isAdmin && (
          <button
            onClick={() => navigate("/leaderboard")}
            className="mt-3 w-full duo-btn duo-btn-ghost text-xs"
          >
            🛡 Admin — skip payment & view wall
          </button>
        )}

        <AnimatePresence mode="wait">
          {meta && Icon && (
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`mt-5 flex items-center justify-center gap-2 text-sm font-bold ${
                state === "success" ? "text-primary" :
                state === "error" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${state !== "success" && state !== "error" ? "animate-spin" : ""}`} />
              <span>{meta.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => navigate("/")} className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground font-bold">
          ← Back
        </button>
      </motion.div>
      <LevelUpOverlay open={levelUp} onClose={() => setLevelUp(false)} />
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground uppercase text-xs tracking-wide">{k}</span>
    <span>{v}</span>
  </div>
);

export default PayPage;
