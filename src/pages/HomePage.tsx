import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import { Flame, Trophy, Users, Sparkles, Zap, ArrowRight, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteStats } from "@/lib/api";
import CountUp from "@/components/CountUp";
import { trackStep } from "@/lib/funnel";
import RecentJoinsTicker from "@/components/RecentJoinsTicker";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/lib/sound";
import { getSS, SS } from "@/lib/session";

/* ─── Interactive Owl + Premium Card ─────────────────────────────────────── */
const InteractiveOwl = () => {
  const owlRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  // Spring-physics mouse tracking
  const rawX = useRef(0);
  const rawY = useRef(0);
  const springX = useSpring(0, { stiffness: 80, damping: 18 });
  const springY = useSpring(0, { stiffness: 80, damping: 18 });
  const rotateY = useTransform(springX, [-1, 1], [-18, 18]);
  const rotateX = useTransform(springY, [-1, 1], [10, -10]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = owlRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.current = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2;
      rawY.current = ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2;
      springX.set(rawX.current);
      springY.set(rawY.current);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [springX, springY]);

  const [hovered, setHovered] = useState(false);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (owlRef.current) {
      const r = owlRef.current.getBoundingClientRect();
      setBubblePos({ x: r.left + r.width / 2, y: r.bottom + 10 });
    }
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setBubblePos(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center px-2"
    >
      {/* ── Owl (sits on top of card) ── */}
      <div
        ref={owlRef}
        className="relative flex-shrink-0 z-10 -mb-4"
        style={{ perspective: "600px" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="text-[6rem] md:text-[7.5rem] leading-none select-none cursor-pointer"
            aria-label="Owl mascot"
          >
            🦉
          </motion.div>
        </motion.div>

        {/* Hakuna Matata — Portal bubble, fixed in viewport, never clipped */}
        {hovered && bubblePos && createPortal(
          <AnimatePresence>
            <motion.div
              key="hakuna"
              initial={{ opacity: 0, scale: 0.75, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: -6 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              style={{
                position: "fixed",
                left: bubblePos.x,
                top: bubblePos.y,
                transform: "translateX(-50%)",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              {/* Tail pointing UP */}
              <div className="flex flex-col items-center">
                <div
                  style={{
                    width: 0, height: 0,
                    borderLeft: "9px solid transparent",
                    borderRight: "9px solid transparent",
                    borderBottom: "9px solid hsl(var(--border))",
                  }}
                />
                <div
                  className="bg-card border-2 border-border rounded-2xl shadow-2xl px-5 py-2.5 whitespace-nowrap"
                  style={{ marginTop: "-1px" }}
                >
                  <span className="font-display text-base text-foreground">
                    Hakuna Matata 🌈
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </div>

      {/* ── Premium Card (below the owl) ── */}
      <div className="duo-card relative w-full max-w-sm sm:max-w-md overflow-hidden pt-8 pb-5 px-5 sm:px-6 transition-all duration-350 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(88,204,2,0.18)] hover:border-primary/40">
        {/* Animated background glow */}
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-primary rounded-2xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Gold Star top-left + Window dots top-right */}
          <div className="flex items-start justify-between">
            <motion.span
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="text-3xl select-none"
            >
              ⭐
            </motion.span>
            <div className="flex gap-1.5 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            </div>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-2xl sm:text-[1.85rem] leading-snug text-foreground tracking-tight select-none">
            Pay <span className="relative inline-block px-2.5 py-0.5 mx-1.5 bg-primary/20 text-primary rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(88,204,2,0.25)] font-black">₹1</span> to see
            <br />
            who paid <span className="relative inline-block px-2.5 py-0.5 mx-1.5 bg-accent/20 text-accent rounded-xl border border-accent/30 shadow-[0_0_15px_rgba(28,176,246,0.25)] font-black">₹1</span>
          </h2>

          {/* Subtext */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            One rupee. That's all. Forever on the wall.
          </p>

          {/* SEE THE WALL button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              play("click");
              document.getElementById("wall-preview")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="duo-btn duo-btn-primary w-full text-sm py-3 mt-1 font-black uppercase tracking-wider"
          >
            SEE THE WALL
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Home Page ──────────────────────────────────────────────────────────── */
const HomePage = () => {
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();
  const { play } = useSound();
  const [count, setCount] = useState(0);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const hasPaid = !!getSS(SS.sessionToken);

  useEffect(() => { trackStep("home_view"); }, []);

  useEffect(() => {
    let mounted = true;
    fetchSiteStats().then((s) => {
      if (!mounted) return;
      setCount(s.total_payers);
      setPaymentEnabled(s.payment_enabled);
    });

    const channel = supabase
      .channel("site_stats_home")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_stats" }, (payload) => {
        const next = (payload.new as { total_payers?: number; payment_enabled?: boolean }) ?? {};
        setCount(next.total_payers ?? 0);
        setPaymentEnabled(next.payment_enabled ?? true);
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const goPay = () => {
    play("click");
    if (isAdmin) { navigate("/leaderboard"); return; }
    navigate(session ? "/pay" : "/auth?next=/pay");
  };

  return (
    <PageShell className="text-foreground overflow-x-hidden pb-36">
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative px-6 md:px-12 py-8 md:py-14 w-full"
      >
        <div className="flex flex-col items-center text-center gap-6">
          {/* Interactive owl + guide panel — the centrepiece */}
          <InteractiveOwl />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 duo-chip bg-primary/15 text-primary"
          >
            <span className="h-2 w-2 rounded-full bg-primary pulse-ring" />
            <CountUp to={count} /> Legends joined
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight"
          >
            Pay <span className="text-primary">₹1</span>.<br />
            Earn <span className="text-gold">XP</span>.<br />
            Join the <span className="text-accent">Wall</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-md text-base md:text-lg text-muted-foreground"
          >
            A tiny quest. One rupee. Forever on the wall of legends. Ready to level up?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-3 w-full max-w-xs"
          >
            {paymentEnabled ? (
              <>
                <button onClick={goPay} className="duo-btn duo-btn-primary w-full text-base py-4">
                  <Zap className="h-5 w-5" />
                  {isAdmin ? "Open Wall (Admin)" : session ? "START THE QUEST" : "Login & Start"}
                </button>
                {!session && (
                  <button
                    onClick={() => { play("click"); navigate("/auth"); }}
                    className="duo-btn duo-btn-ghost w-full"
                  >
                    <LogIn className="h-4 w-4" /> Sign in first
                  </button>
                )}
                <button
                  onClick={() => {
                    play("click");
                    document.getElementById("wall-preview")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Trophy className="h-3.5 w-3.5" /> Peek at the wall ↓
                </button>
              </>
            ) : (
              <div className="duo-card text-center w-full">
                <p className="font-display text-lg">Quest closed for now 🏁</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      <RecentJoinsTicker />

      {/* Stat tiles */}
      <section className="px-6 md:px-12 mt-16 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile icon={<Users className="h-7 w-7" />} label="Legends" value={count.toLocaleString("en-IN")} color="primary" />
          <StatTile icon={<Flame className="h-7 w-7" />} label="Entry Fee" value="₹1" color="gold" />
          <StatTile icon={<Sparkles className="h-7 w-7" />} label="XP Reward" value="+100" color="accent" />
        </div>
      </section>

      {/* Blurred leaderboard preview */}
      <LeaderboardPreview />

      <section className="px-6 md:px-12 mt-16 max-w-3xl mx-auto w-full">
        <h2 className="font-display text-2xl md:text-3xl text-center mb-8">Your quest, 3 steps 🎯</h2>
        <div className="space-y-4">
          {[
            { n: 1, t: "Login or Sign up", d: "Email or phone + password — no SMS needed.", emoji: "🔐" },
            { n: 2, t: "Pay ₹1", d: "Secure UPI / card / wallet via Razorpay.", emoji: "💸" },
            { n: 3, t: "Earn XP & climb", d: "Refer friends, unlock badges, rank up.", emoji: "🏆" },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="duo-card flex items-center gap-4"
            >
              <div className="text-4xl">{s.emoji}</div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">Step {s.n}</div>
                <div className="font-display text-lg">{s.t}</div>
                <div className="text-sm text-muted-foreground">{s.d}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </PageShell>
  );
};

/* ─── Stat tile ──────────────────────────────────────────────────────────── */
const StatTile = ({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: "primary" | "gold" | "accent";
}) => {
  const colorMap = { primary: "bg-primary/15 text-primary", gold: "bg-gold/15 text-gold", accent: "bg-accent/15 text-accent" };
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02 }}
      className="duo-card flex items-center gap-4 w-full"
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
        <div className="font-display text-2xl">{value}</div>
      </div>
    </motion.div>
  );
};

export default HomePage;
