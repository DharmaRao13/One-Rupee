import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { fetchLedger, LedgerRow } from "@/lib/api";

const RecentJoinsTicker = () => {
  const [rows, setRows] = useState<LedgerRow[]>([]);

  useEffect(() => {
    fetchLedger().then((r) => setRows(r.slice(0, 24)));
    const ch = supabase
      .channel("recent_joins_home")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users_ledger" }, (p) => {
        setRows((prev) => [p.new as LedgerRow, ...prev].slice(0, 24));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (rows.length === 0) return null;
  const dupe = [...rows, ...rows];

  return (
    <section aria-label="Newest legends" className="mt-12">
      <div className="flex items-center justify-between px-6 md:px-12 max-w-5xl mx-auto mb-3">
        <h2 className="font-display text-xl">Fresh legends 🌟</h2>
        <span className="duo-chip bg-primary/15 text-primary">LIVE</span>
      </div>
      <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
        <div className="scroll-x-track flex gap-3 px-6">
          {dupe.map((r, i) => (
            <motion.div
              key={`${r.id}-${i}`}
              whileHover={{ y: -4, scale: 1.04 }}
              className="shrink-0 duo-card !p-3 flex items-center gap-3 min-w-[200px]"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-display text-lg shrink-0">
                {r.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm truncate">{r.display_name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">just joined</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentJoinsTicker;
