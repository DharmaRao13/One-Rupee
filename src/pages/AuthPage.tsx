import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, isEmailLike, useAuth } from "@/lib/auth";
import { useSound } from "@/lib/sound";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { session, loading } = useAuth();
  const { play } = useSound();
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) || "login");
  const [identifier, setId] = useState(""); // email OR phone
  const [password, setPw] = useState("");
  const [displayName, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/pay";

  useEffect(() => {
    if (!loading && session && mode !== "forgot") nav(next, { replace: true });
  }, [loading, session, nav, next, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = isEmailLike(identifier) ? identifier.trim() : phoneToEmail(identifier);
    try {
      if (mode === "forgot") {
        if (!isEmailLike(identifier)) {
          throw new Error("Password reset is only supported for email signups.");
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        play("success");
        toast.success("Password reset link sent to your email!");
        setMode("login");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName || identifier.split("@")[0],
              phone: isEmailLike(identifier) ? null : identifier,
            },
          },
        });
        if (error) throw error;
        play("success");
        toast.success("Account created! Logging you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        play("success");
      }
    } catch (e) {
      play("error");
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-full max-w-md duo-card"
      >
        <div className="text-center mb-6">
          <div className="text-6xl bounce-soft mb-2">🦉</div>
          <h1 className="font-display text-3xl">
            {mode === "login" ? "Welcome back, hero!" : mode === "signup" ? "Join the legends" : "Reset your password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Log in to continue your quest." : mode === "signup" ? "Create your free account in 10 seconds." : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {mode !== "forgot" ? (
          <div className="flex gap-2 mb-5 bg-background-soft p-1 rounded-2xl">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); play("click"); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-3">
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-xs font-bold uppercase text-muted-foreground">Display Name</label>
                <div className="relative mt-1">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className="duo-input pl-10"
                    value={displayName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="HeroOwl42"
                    maxLength={32}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              {mode === "forgot" ? "Email Address" : "Email or Phone"}
            </label>
            <div className="relative mt-1">
              {isEmailLike(identifier) || identifier === "" ? (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <input
                required
                className="duo-input pl-10"
                value={identifier}
                onChange={(e) => setId(e.target.value)}
                placeholder={mode === "forgot" ? "you@email.com" : "you@email.com or 9876543210"}
                autoComplete="username"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  minLength={6}
                  className="duo-input pl-10"
                  value={password}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
              {mode === "login" && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); play("click"); }}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={busy} className="duo-btn duo-btn-primary w-full py-4 text-base mt-2">
            {busy ? "…" : mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => { setMode("login"); play("click"); }}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground font-bold"
          >
            ← Back to Log in
          </button>
        )}

        {mode !== "forgot" && (
          <p className="text-xs text-center text-muted-foreground mt-5">
            Phone signups don't send SMS — just pick a password you'll remember.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
