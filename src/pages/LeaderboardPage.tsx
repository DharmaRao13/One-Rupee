import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import html2canvas from "html2canvas";
import { Crown, Share2, Download, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchLedger, fetchSiteStats, LedgerRow } from "@/lib/api";
import { getSS, setSS, SS } from "@/lib/session";
import { toast } from "@/hooks/use-toast";
import { BadgeRow } from "@/components/BadgePill";
import RankCard from "@/components/RankCard";
import CountUp from "@/components/CountUp";
import { trackStep } from "@/lib/funnel";

type Tab = "all" | "top";

interface RefStat {
  display_name: string;
  referral_code: string;
  referral_count: number;
}

const LeaderboardPage = () => {
  const nav = useNavigate();
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [topRefs, setTopRefs] = useState<RefStat[]>([]);
  const [hidden, setHidden] = useState(false);
  const me = getSS(SS.displayName) ?? "friend";
  const myRefCode = getSS(SS.referralCode);
  const isPremium = getSS(SS.isPremium) === "true";
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackStep("leaderboard_view"); }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchLedger(), fetchSiteStats()])
      .then(([l, s]) => {
        if (!mounted) return;
        setRows(l);
        setTotal(s.total_payers);
        setHidden(!s.leaderboard_enabled);
      })
      .catch((e) => toast({ title: "Could not load wall", description: e?.message, variant: "destructive" }))
      .finally(() => mounted && setLoading(false));

    supabase
      .from("referral_stats")
      .select("display_name, referral_code, referral_count")
      .order("referral_count", { ascending: false })
      .limit(20)
      .then(({ data }) => setTopRefs((data as RefStat[]) ?? []));

    const ch = supabase
      .channel("leaderboard_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users_ledger" }, (payload) => {
        const row = payload.new as LedgerRow;
        setRows((prev) => [row, ...prev]);
        setTotal((t) => t + 1);
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);

  const myRank = useMemo(() => {
    const idx = rows.findIndex((r) => r.display_name === me);
    if (idx < 0) return 0;
    const r = rows.length - idx;
    setSS(SS.userRank, String(r));
    return r;
  }, [rows, me]);

  const myRow = useMemo(() => rows.find((r) => r.display_name === me), [rows, me]);

  const { premium, standard } = useMemo(() => ({
    premium: rows.filter((r) => r.tier === "premium"),
    standard: rows.filter((r) => r.tier !== "premium"),
  }), [rows]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement("a");
    link.download = "my-rank-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareCard = async () => {
    const text = `I'm #${myRank} on the ₹1 Quest wall 🦉 Can you beat my rank? ${window.location.origin}`;
    if (cardRef.current && navigator.share && (navigator as any).canShare) {
      try {
        const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
        const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
        if (blob) {
          const file = new File([blob], "rank-card.png", { type: "image/png" });
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({ files: [file], text, title: "My Rank" });
            return;
          }
        }
      } catch { /* */ }
    }
    try { await navigator.clipboard.writeText(text); toast({ title: "Copied!" }); } catch { /* */ }
  };

  const refLink = myRefCode ? `${window.location.origin}/ref/${myRefCode}` : "";
  const copyRef = async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink);
    toast({ title: "Referral link copied 🔗" });
  };
  const shareRef = async () => {
    if (!refLink) return;
    const text = `Join the ₹1 Quest with me 🦉 ${refLink}`;
    if (navigator.share) {
      try { await navigator.share({ text, url: refLink, title: "Join the quest" }); return; } catch { /* */ }
    }
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  if (hidden) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background-soft text-foreground">
        <div className="duo-card max-w-md text-center">
          <div className="text-5xl mb-2">🛠️</div>
          <h1 className="font-display text-xl">Wall under maintenance</h1>
          <p className="mt-2 text-muted-foreground text-sm">Check back soon.</p>
        </div>
      </div>
    );
  }

  const renderRow = (r: LedgerRow, rank: number, isMe: boolean, idx = 0) => {
    const isPremiumRow = r.tier === "premium";
    return (
      <motion.div key={r.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.02, 0.6), duration: 0.3 }}
        whileHover={{ y: -1, scale: 1.005 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 mb-2 transition-colors ${
          isMe
            ? "bg-primary/10 border-primary"
            : isPremiumRow
            ? "bg-gold/10 border-gold/40"
            : "bg-card border-border hover:border-accent/40"
        }`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-base ${
          rank === 1 ? "bg-gold text-card-foreground" :
          rank === 2 ? "bg-muted text-card-foreground" :
          rank === 3 ? "bg-[#cd7f32] text-white" :
          "bg-background-soft text-muted-foreground"
        }`}>
          {rank <= 3 ? (rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉") : <span className="text-sm">#{rank}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-display truncate ${isPremiumRow ? "text-gold-shadow" : ""}`}>{r.display_name}</span>
            {isMe && <span className="duo-chip bg-primary text-primary-foreground text-[10px] py-0.5">You</span>}
            {isPremiumRow && <Crown className="h-3.5 w-3.5 text-gold-shadow" />}
          </div>
          <div className="text-xs text-muted-foreground font-bold">
            {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
            {(r.referral_count ?? 0) > 0 && <span className="ml-2">· {r.referral_count} refs</span>}
          </div>
          {r.badges && r.badges.length > 0 && <div className="mt-1"><BadgeRow badges={r.badges} max={3} /></div>}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background-soft text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-gold" />
            <h1 className="text-3xl md:text-4xl font-display">Wall of Legends</h1>
          </div>
          <div className="duo-chip bg-primary/10 text-primary">
            <CountUp to={total} /> legends
          </div>
        </motion.div>

        {/* Welcome banner */}
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="mt-5 rounded-2xl bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between border-b-4 border-primary-shadow"
        >
          <div>
            <div className="text-xs uppercase tracking-wider opacity-90 font-bold">Welcome back</div>
            <div className="font-display text-xl">{me} 🦉</div>
          </div>
          {myRank > 0 && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider opacity-90 font-bold">Your rank</div>
              <div className="font-display text-2xl tabular-nums">
                #<CountUp from={total} to={myRank} duration={800} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Rank card */}
        {myRank > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <RankCard ref={cardRef} rank={myRank} total={total} displayName={me} badges={myRow?.badges ?? []} />
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={downloadCard} className="duo-btn duo-btn-primary text-xs"><Download className="h-4 w-4" /> Download</button>
              <button onClick={shareCard} className="duo-btn duo-btn-accent text-xs"><Share2 className="h-4 w-4" /> Share</button>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {!isPremium && (
          <div className="mt-6 duo-card flex items-center justify-between gap-3 flex-wrap bg-gold/10 border-gold/40">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-gold-shadow" />
              <span className="text-sm font-bold">Unlock a <span className="text-gold-shadow">golden name</span> with Premium</span>
            </div>
            <button onClick={() => nav("/upgrade")} className="duo-btn duo-btn-gold text-xs">Go Premium</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 flex gap-2">
          <button onClick={() => setTab("all")} className={`duo-btn text-xs ${tab === "all" ? "duo-btn-primary" : "duo-btn-ghost"}`}>
            <Trophy className="h-4 w-4" /> All
          </button>
          <button onClick={() => setTab("top")} className={`duo-btn text-xs ${tab === "top" ? "duo-btn-accent" : "duo-btn-ghost"}`}>
            <Crown className="h-4 w-4" /> Top Referrers
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="duo-card text-center text-muted-foreground">Loading the wall…</div>
          ) : tab === "top" ? (
            topRefs.length === 0 ? (
              <div className="duo-card text-center text-muted-foreground">No referrers yet.</div>
            ) : (
              topRefs.map((r, i) => (
                <div key={r.referral_code} className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-border bg-card mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-display">#{i + 1}</div>
                  <div className="flex-1 truncate font-display">{r.display_name}{r.referral_count >= 5 && <span className="ml-1">👑</span>}</div>
                  <div className="font-display text-lg text-accent">{r.referral_count}</div>
                </div>
              ))
            )
          ) : rows.length === 0 ? (
            <div className="duo-card text-center text-muted-foreground">No legends yet. Be the first 🦉</div>
          ) : (
            <>
              {premium.length > 0 && (
                <>
                  <div className="duo-chip bg-gold/15 text-gold-shadow mb-2">💎 Premium Legends</div>
                  {premium.map((r, i) => {
                    const rank = rows.length - rows.indexOf(r);
                    return renderRow(r, rank, r.display_name === me, i);
                  })}
                  <div className="duo-chip bg-background text-muted-foreground border border-border mt-4 mb-2">All Legends</div>
                </>
              )}
              {standard.map((r, i) => {
                const rank = rows.length - rows.indexOf(r);
                return renderRow(r, rank, r.display_name === me, i);
              })}
            </>
          )}
        </div>

        {/* Personal referral */}
        {myRefCode && (
          <div className="mt-8 duo-card">
            <h3 className="font-display text-lg flex items-center gap-2"><Share2 className="h-5 w-5 text-accent" /> Your referral link</h3>
            <div className="mt-3 font-mono text-xs md:text-sm break-all bg-background-soft border-2 rounded-2xl p-3">{refLink}</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={copyRef} className="duo-btn duo-btn-primary text-xs">Copy</button>
              <button onClick={shareRef} className="duo-btn duo-btn-accent text-xs">Share</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-bold">You've referred {myRow?.referral_count ?? 0} legends so far.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
