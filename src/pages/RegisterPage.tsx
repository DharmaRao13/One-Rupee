import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { registerUser, fetchVerifiedSession } from "@/lib/api";
import { getSS, setSS, SS, clearFlow } from "@/lib/session";
import { trackStep } from "@/lib/funnel";

const MAX = 30;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => { trackStep("register_view"); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = getSS(SS.sessionToken);
      if (!t) { toast.error("Session invalid"); navigate("/", { replace: true }); return; }
      try {
        const sess = await fetchVerifiedSession(t);
        if (cancelled) return;
        if (!sess || !sess.verified) {
          clearFlow();
          toast.error("Session invalid");
          navigate("/", { replace: true });
          return;
        }
        if (sess.used) {
          if (sess.display_name) setSS(SS.displayName, sess.display_name);
          setSS(SS.userRegistered, "true");
          navigate("/leaderboard", { replace: true });
          return;
        }
        setToken(t);
        setChecking(false);
      } catch {
        if (!cancelled) { toast.error("Session check failed"); navigate("/", { replace: true }); }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const clean = name.trim();
    if (clean.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    if (!/^[A-Za-z0-9 ._-]+$/.test(clean)) { toast.error("Letters, numbers, spaces, . _ - only"); return; }

    setSubmitting(true);
    try {
      const referredBy = getSS(SS.referredByCode);
      const res = await registerUser(token, clean, referredBy);
      setSS(SS.userRegistered, "true");
      setSS(SS.displayName, clean);
      if (res.user.referral_code) setSS(SS.referralCode, res.user.referral_code);
      await trackStep("register_success");
      toast.success("You're on the wall! 🎉");
      navigate("/leaderboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not register";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background-soft">
        <div className="text-5xl bounce-soft">🦉</div>
        <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Verifying quest…</div>
      </div>
    );
  }

  const len = name.length;
  const counterColor =
    len > MAX * 0.9 ? "text-destructive" :
    len > MAX * 0.7 ? "text-gold-shadow" : "text-muted-foreground";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 pb-32 bg-background-soft text-foreground">
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-md"
      >
        {/* XP banner */}
        <div className="mb-5 duo-chip bg-primary text-primary-foreground mx-auto w-fit pop-in">
          <Sparkles className="h-3.5 w-3.5" /> +100 XP earned
        </div>

        <div className="duo-card">
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary mb-6">
            <ShieldCheck className="h-4 w-4" />
            <span>Payment verified ✓</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display leading-tight">
            Pick your <span className="text-primary">legend name</span> 🏷️
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">This is what the wall will show — forever.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, MAX))}
                maxLength={MAX}
                placeholder="brave_owl"
                className="duo-input mt-2"
              />
              <span className={`mt-1 block text-xs font-bold tabular-nums ${counterColor}`}>{len}/{MAX}</span>
            </label>

            <button
              type="submit"
              disabled={submitting || name.trim().length < 2}
              className="duo-btn duo-btn-primary w-full text-base py-4"
            >
              {submitting ? "ADDING…" : "ADD ME TO THE WALL 🚀"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
