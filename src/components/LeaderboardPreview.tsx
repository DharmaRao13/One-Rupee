import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Trophy } from "lucide-react";
import { fetchLedger, LedgerRow } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/lib/sound";
import { getSS, SS } from "@/lib/session";

/** Expanded blurred leaderboard preview shown on the home page. */
const LeaderboardPreview = () => {
  const nav = useNavigate();
  const { isAdmin, session } = useAuth();
  const { play } = useSound();
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [hover, setHover] = useState(false);

  // Fetch up to 12 rows for a more generous preview
  useEffect(() => { fetchLedger().then((r) => setRows(r.slice(0, 12))); }, []);

  const hasPaid = !!getSS(SS.sessionToken);
  const unlocked = isAdmin || hasPaid;

  const click = () => {
    play(unlocked ? "success" : "click");
    if (unlocked) nav("/leaderboard");
    else if (!session) nav("/auth?next=/pay");
    else nav("/pay");
  };

  const MEDALS = ["🥇", "🥈", "🥉"];

  // Placeholder rows when data hasn't loaded
  const placeholders: LedgerRow[] = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i),
    display_name: ["MysteryHero", "SecretLegend", "HiddenStar", "BlurredAce",
      "UnknownOwl", "QuietBoss", "ShadowSeeker", "GhostRank",
      "VeiledChamp", "NightWalker", "SilentQuest", "CrypticAce"][i],
    created_at: "",
  } as LedgerRow));

  const displayRows = rows.length ? rows : placeholders;

  return (
    <section id="wall-preview" className="px-4 md:px-12 mt-24 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl flex items-center gap-2">
          <Trophy className="text-gold h-6 w-6 md:h-7 md:w-7" /> The Wall of Legends
        </h2>
        <span className="duo-chip bg-accent/15 text-accent text-[10px] md:text-xs">
          {unlocked ? "Live" : "Preview"}
        </span>
      </div>

      <div
        className="relative duo-card !p-0 overflow-hidden cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={click}
      >
        {/* Blurred / visible rows */}
        <div
          className={`transition-all duration-500 ${
            unlocked ? "blur-0" : "blur-md"
          } ${unlocked ? "" : "select-none pointer-events-none"}`}
        >
          {/* Top 3 podium strip */}
          <div className="grid grid-cols-3 gap-3 p-4 pb-2 border-b border-border bg-background-soft/60">
            {displayRows.slice(0, 3).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-2 py-5"
              >
                <span className="text-3xl md:text-4xl">{MEDALS[i]}</span>
                <div
                  className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center font-display text-xl md:text-2xl ${
                    i === 0 ? "bg-gold/20 text-gold" :
                    i === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                              "bg-[hsl(25_60%_40%)]/20 text-[hsl(25_80%_60%)]"
                  }`}
                >
                  {r.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <span className="font-display text-[11px] md:text-xs text-center truncate w-full px-1 max-w-[80px]">
                  {r.display_name}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold">#{i + 1}</span>
              </motion.div>
            ))}
          </div>

          {/* Rows 4–12 */}
          <div className="p-3 space-y-1.5">
            {displayRows.slice(3).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-background-soft border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-7 text-center font-display text-sm text-muted-foreground">
                  #{i + 4}
                </div>
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display text-sm shrink-0">
                  {r.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="font-display text-sm flex-1 truncate">{r.display_name}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lock overlay — only when not unlocked */}
        {!unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-[2px]">
            <motion.button
              onClick={(e) => { e.stopPropagation(); click(); }}
              whileTap={{ scale: 0.94 }}
              className="duo-btn duo-btn-gold px-6 py-4 text-base shadow-2xl"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={hover ? "unlock" : "lock"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  {hover ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  {hover ? "Unlock for ₹1" : "Locked — Pay ₹1"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <p className="text-xs text-muted-foreground">
              {displayRows.length} legends already inside
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LeaderboardPreview;
