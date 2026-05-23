import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Joiner {
  id: string;
  display_name: string;
}

const truncate = (n: string) => (n.length > 12 ? n.slice(0, 12) + "…" : n);

export const LiveTicker = () => {
  const [list, setList] = useState<Joiner[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("users_ledger")
      .select("id, display_name")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (mounted && data) setList(data as Joiner[]);
      });

    const ch = supabase
      .channel("ticker_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "users_ledger" },
        (payload) => {
          const row = payload.new as Joiner;
          setList((prev) => [row, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  if (list.length === 0) return null;
  const doubled = [...list, ...list];

  return (
    <div className="border-y border-border bg-card overflow-hidden py-2">
      <div className="flex whitespace-nowrap ticker-track text-sm font-mono text-primary">
        {doubled.map((j, i) => (
          <span key={`${j.id}-${i}`} className="px-4 inline-flex items-center gap-2">
            <span>👤 {truncate(j.display_name)} joined</span>
            <span className="text-primary/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
