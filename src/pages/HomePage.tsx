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

/* ─── Guide messages per auth state ─────────────────────────────────────── */
type GuideStep = { emoji: string; headline: string; sub: string; cta: string; ctaPath: string; color: string };

const getGuideSteps = (session: boolean, hasPaid: boolean, isAdmin: boolean): GuideStep[] => {
  if (isAdmin) return [
    { emoji: "🛡️", headline: "Admin mode active", sub: "You have full access to the dashboard.", cta: "Open Dashboard", ctaPath: "/admin", color: "text-gold" },
  ];
  if (!session) return [
    { emoji: "👋", headline: "Welcome, stranger!", sub: "Create a free account to begin your quest.", cta: "Login / Sign up", ctaPath: "/auth?next=/pay", color: "text-accent" },
    { emoji: "🌟", headline: "It costs just ₹1", sub: "One rupee. That's all. Forever on the wall.", cta: "See the Wall", ctaPath: "/#wall-preview", color: "text-gold" },
    { emoji: "🚀", headline: "Earn XP & climb", sub: "Refer friends, unlock badges, dominate the board.", cta: "Get Started", ctaPath: "/auth", color: "text-primary" },
  ];
  if (!hasPaid) return [
    { emoji: "💸", headline: "You're logged in!", sub: "Now pay ₹1 to unlock the wall forever.", cta: "Pay ₹1 Now", ctaPath: "/pay", color: "text-primary" },
    { emoji: "🔓", headline: "Almost there…", sub: "One tap payment via UPI, card or wallet.", cta: "Complete Quest", ctaPath: "/pay", color: "text-accent" },
  ];
  return [
    { emoji: "🏆", headline: "You're a Legend!", sub: "You're on the wall. Refer friends for bonus XP.", cta: "View the Wall", ctaPath: "/leaderboard", color: "text-gold" },
    { emoji: "⚡", headline: "Earn more XP", sub: "Share your referral link and climb the ranks.", cta: "Leaderboard", ctaPath: "/leaderboard", color: "text-primary" },
  ];
};

/* ─── Interactive Owl + Guide Panel ─────────────────────────────────────── */
const InteractiveOwl = ({
  session, hasPaid, isAdmin,
}: { session: boolean; hasPaid: boolean; isAdmin: boolean }) => {
  const navigate = useNavigate();
  const owlRef = useRef<HTMLDivElement>(null);

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

  // Guide messages
  const steps = getGuideSteps(session, hasPaid, isAdmin);
  const [msgIdx, setMsgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  // Fixed pixel position for the Hakuna Matata portal bubble
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

  // Cycle guide messages every 3.5s (pause on hover)
  useEffect(() => {
    if (hovered || steps.length <= 1) return;
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % steps.length), 3500);
    return () => clearInterval(id);
  }, [hovered, steps.length]);

  const current = steps[msgIdx];

  const handleCta = useCallback(() => {
    if (current.ctaPath.startsWith("/#")) {
      document.getElementById(current.ctaPath.replace("/#", ""))?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      navigate(current.ctaPath);
    }
  }, [current, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 px-2"
    >
      {/* ── Owl ── */}
      <div
        ref={owlRef}
        className="relative flex-shrink-0"
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

      {/* ── Guide Panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="duo-card flex flex-col gap-3 max-w-xs w-full text-left relative overflow-hidden"
        >
          {/* Animated background glow */}
          <motion.div
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-primary rounded-2xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col gap-3">
            {/* Emoji + step dots */}
            <div className="flex items-start justify-between">
              <motion.span
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-3xl select-none"
              >
                {current.emoji}
              </motion.span>
              {/* Dot indicators */}
              {steps.length > 1 && (
                <div className="flex gap-1.5 mt-1">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMsgIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === msgIdx ? "w-4 bg-primary" : "w-1.5 bg-border"
                      }`}
                      aria-label={`Guide step ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className={`font-display text-lg md:text-xl leading-snug ${current.color}`}>
                {current.headline}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {current.sub}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCta}
              className="duo-btn duo-btn-primary w-full text-sm py-2.5 mt-1"
            >
              {current.cta}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
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
          <InteractiveOwl
            session={!!session}
            hasPaid={hasPaid}
            isAdmin={isAdmin}
          />

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
