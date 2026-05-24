import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSound } from "@/lib/sound";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { play } = useSound();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });
      if (error) throw error;

      play("success");
      toast.success("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (err) {
      play("error");
      toast.error((err as Error).message);
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
          <div className="text-6xl bounce-soft mb-2">🔑</div>
          <h1 className="font-display text-3xl">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                required
                type="password"
                minLength={6}
                className="duo-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" disabled={busy} className="duo-btn duo-btn-primary w-full py-4 text-base mt-2">
            {busy ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
