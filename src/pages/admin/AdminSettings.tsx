import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/adminLog";

const AdminSettings = () => {
  const [stats, setStats] = useState<{ total_payers: number; leaderboard_enabled: boolean; payment_enabled: boolean } | null>(null);
  const [count, setCount] = useState<number>(0);
  const [confirmText, setConfirmText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("site_stats").select("total_payers, leaderboard_enabled, payment_enabled").eq("id", 1).maybeSingle();
    if (data) { setStats(data as any); setCount(data.total_payers); }
  };
  useEffect(() => { load(); }, []);

  const updateStats = async (patch: Partial<NonNullable<typeof stats>>) => {
    await supabase.from("site_stats").update(patch).eq("id", 1);
    setStats((s) => (s ? { ...s, ...patch } : s));
  };

  const updateCount = async () => {
    await updateStats({ total_payers: count });
    await logAdminAction("Updated total_payers", String(count));
  };

  const toggleLeaderboard = async () => {
    if (!stats) return;
    const v = !stats.leaderboard_enabled;
    await updateStats({ leaderboard_enabled: v });
    await logAdminAction("Toggled leaderboard", v ? "enabled" : "disabled");
  };
  const togglePayment = async () => {
    if (!stats) return;
    const v = !stats.payment_enabled;
    await updateStats({ payment_enabled: v });
    await logAdminAction("Toggled payment", v ? "enabled" : "disabled");
  };

  const resetAll = async () => {
    if (confirmText !== "DELETE") { alert('Type DELETE to confirm.'); return; }
    await supabase.from("payment_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("referral_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("users_ledger").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("site_stats").update({ total_payers: 0 }).eq("id", 1);
    await logAdminAction("Reset all data", "Truncated users + payments");
    setConfirmText("");
    load();
  };

  const exportFull = async () => {
    const [{ data: users }, { data: pay }] = await Promise.all([
      supabase.from("users_ledger").select("*"),
      supabase.from("payment_logs").select("*"),
    ]);
    const toCsv = (rows: any[]) => {
      if (!rows || rows.length === 0) return "";
      const cols = Object.keys(rows[0]);
      return [cols.join(","), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    };
    const blob = new Blob([
      "USERS_LEDGER\n", toCsv(users ?? []), "\n\nPAYMENT_LOGS\n", toCsv(pay ?? []),
    ], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `full_export_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    await logAdminAction("Exported full database", "");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Settings</h1>

      <section className="bg-[#161b22] border border-[#30363d] p-4 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Site Stats Override</h2>
        <div className="text-xs text-[#7d8590] mb-2">Current: {stats?.total_payers ?? 0}</div>
        <div className="flex gap-2 items-center">
          <input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value || "0", 10))} className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm w-32" />
          <button onClick={updateCount} className="bg-[#f59e0b] text-black px-3 py-1 text-xs font-bold">Update</button>
        </div>
      </section>

      <section className="bg-[#161b22] border border-[#30363d] p-4 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Leaderboard Controls</h2>
        <label className="flex items-center justify-between py-2 border-b border-[#30363d] cursor-pointer">
          <span>Leaderboard Visible to Public</span>
          <input type="checkbox" checked={!!stats?.leaderboard_enabled} onChange={toggleLeaderboard} />
        </label>
        <label className="flex items-center justify-between py-2 cursor-pointer">
          <span>Payment Enabled</span>
          <input type="checkbox" checked={!!stats?.payment_enabled} onChange={togglePayment} />
        </label>
      </section>

      <section className="bg-[#161b22] border-2 border-[#ef4444] p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#ef4444] mb-3">Danger Zone</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#7d8590] mb-2">Type <span className="font-mono text-[#ef4444]">DELETE</span> to enable reset.</p>
            <div className="flex gap-2">
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE" className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm" />
              <button onClick={resetAll} className="bg-[#ef4444] text-white px-3 py-1 text-xs font-bold">Reset All Data</button>
            </div>
          </div>
          <button onClick={exportFull} className="bg-[#0d1117] border border-[#30363d] px-3 py-1 text-xs">Export Full Database</button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminSettings;
