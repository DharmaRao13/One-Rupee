import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export const DailyChart = () => {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const since = subDays(new Date(), 30).toISOString();
    supabase
      .from("users_ledger")
      .select("created_at")
      .gte("created_at", since)
      .then(({ data: rows }) => {
        const byDay = new Map<string, number>();
        for (let i = 29; i >= 0; i--) {
          const d = format(subDays(new Date(), i), "MMM d");
          byDay.set(d, 0);
        }
        (rows ?? []).forEach((r: any) => {
          const d = format(startOfDay(new Date(r.created_at)), "MMM d");
          byDay.set(d, (byDay.get(d) ?? 0) + 1);
        });
        setData(Array.from(byDay, ([date, count]) => ({ date, count })));
      });
  }, []);

  return (
    <div className="bg-[#161b22] border border-[#30363d] p-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        Daily Signups (Last 30 Days)
      </h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="date" stroke="#7d8590" tick={{ fontSize: 10 }} />
            <YAxis stroke="#7d8590" tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3" }}
              labelStyle={{ color: "#f59e0b" }}
            />
            <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyChart;
