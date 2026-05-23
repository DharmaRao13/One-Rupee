import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useSound } from "@/lib/sound";

interface Props { open: boolean; onClose: () => void; xp?: number; }

/** Duolingo-style level-up celebration after payment. */
const LevelUpOverlay = ({ open, onClose, xp = 100 }: Props) => {
  const { play } = useSound();

  useEffect(() => {
    if (open) {
      play("level_up");
      const t = setTimeout(onClose, 3200);
      return () => clearTimeout(t);
    }
  }, [open, onClose, play]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* radial burst */}
          <motion.div
            className="absolute h-[600px] w-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--gold)/.35), transparent 60%)" }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}
          />
          {/* particles */}
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (i / 28) * Math.PI * 2;
            const dist = 220 + Math.random() * 140;
            return (
              <motion.div
                key={i}
                className="absolute h-3 w-3 rounded-full"
                style={{ background: ["hsl(var(--primary))","hsl(var(--gold))","hsl(var(--accent))"][i % 3] }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 1.4 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
            );
          })}

          <motion.div
            initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="relative z-10 text-center"
          >
            <div className="text-8xl mb-3 wiggle">🦉</div>
            <div className="font-display text-5xl md:text-6xl text-gold">LEVEL UP!</div>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-display text-lg shadow-lg">
              +{xp} XP earned
            </div>
            <div className="mt-4 text-sm text-muted-foreground font-bold">Tap anywhere to continue</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpOverlay;
