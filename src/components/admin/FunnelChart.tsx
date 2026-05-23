import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

const STEPS: { key: string; label: string }[] = [
  { key: "home_view", label: "🏠 Home Views" },
  { key: "pay_view", label: "💳 Pay Page" },
  { key: "pay_initiated", label: "⚡ Pay Initiated" },
  { key: "pay_success", label: "✅ Pay Success" },
  { key: "register_view", label: "📝 Register View" },
  { key: "register_success", label: "🎉 Register Done" },
  { key: "leaderboard_view", label: "📋 Leaderboard" },
];

type Range = "7d" | "30d" | "all";
type Source = "all" | "organic" | "referral";

export const FunnelChart = () => {
  const [events, setEvents] = useState<{ step: string; session_id: string; referral_code: string | null }[]>([]);
  const [range, setRange] = useState<Range>("30d");
  const [source, setSource] = useState<Source>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from("funnel_events").select("step, session_id, referral_code");
    if (range !== "all") {
      const days = range === "7d" ? 7 : 30;
      q = q.gte("created_at", subDays(new Date(), days).toISOString());
    }
    q.then(({ data }) => {
      setEvents((data as any) ?? []);
      setLoading(false);
    });
  }, [range]);

  const counts = useMemo(() => {
    const filtered = events.filter((e) => {
      if (source === "organic") return !e.referral_code;
      if (source === "referral") return !!e.referral_code;
      return true;
    });
    return STEPS.map((s) => {
      const sessions = new Set(filtered.filter((e) => e.step === s.key).map((e) => e.session_id));
      return { ...s, count: sessions.size };
    });
  }, [events, source]);

  const top = counts[0]?.count || 0;

  return (
    <div className="bg-[#161b22] border border-[#30363d] p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          Funnel
        </h3>
        <div className="flex gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value as Range)} className="bg-[#0d1117] border border-[#30363d] text-xs px-2 py-1">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <select value={source} onChange={(e) => setSource(e.target.value as Source)} className="bg-[#0d1117] border border-[#30363d] text-xs px-2 py-1">
            <option value="all">All sources</option>
            <option value="organic">Organic</option>
            <option value="referral">Via Referral</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[#7d8590]">Loading…</div>
      ) : (
        <div className="space-y-2">
          {counts.map((s, i) => {
            const prev = i === 0 ? s.count : counts[i - 1].count;
            const pct = top === 0 ? 0 : Math.round((s.count / top) * 100);
            const conv = prev === 0 ? 0 : Math.round((s.count / prev) * 100);
            const drop = i === 0 ? 0 : 100 - conv;
            const color = conv >= 80 ? "#22c55e" : conv >= 60 ? "#f59e0b" : "#ef4444";
            return (
              <div key={s.key} className="text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-44 shrink-0 text-[#e6edf3]">{s.label}</span>
                  <div className="flex-1 h-6 bg-[#0d1117] border border-[#30363d] relative overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="w-16 text-right tabular-nums">{s.count}</span>
                  <span className="w-14 text-right tabular-nums" style={{ color }}>{i === 0 ? "100%" : `${conv}%`}</span>
                  <span className="w-20 text-right text-[#ef4444]">{i === 0 || drop <= 0 ? "" : `-${drop}% dropped`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FunnelChart;
