import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface LogRow {
  id: string;
  action: string;
  target: string | null;
  created_at: string;
  performed_by: string | null;
}

export const ActivityLog = ({ limit = 10 }: { limit?: number }) => {
  const [rows, setRows] = useState<LogRow[]>([]);

  useEffect(() => {
    supabase
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => setRows((data as LogRow[]) ?? []));
  }, [limit]);

  return (
    <div className="bg-[#161b22] border border-[#30363d] p-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        Recent Activity
      </h3>
      {rows.length === 0 ? (
        <div className="text-sm text-[#7d8590]">No activity yet.</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="text-sm border-b border-[#30363d] pb-2 last:border-b-0">
              <div className="text-[#e6edf3]">
                <span className="text-[#f59e0b]">{r.action}</span>
                {r.target && <span className="text-[#7d8590]"> — {r.target}</span>}
              </div>
              <div className="text-[10px] text-[#7d8590] mt-0.5">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })} · {r.performed_by ?? "admin"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;
