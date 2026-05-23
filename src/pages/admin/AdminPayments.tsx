import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import FunnelChart from "@/components/admin/FunnelChart";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PaymentRow {
  id: string;
  razorpay_payment_id: string | null;
  display_name: string | null;
  amount: number;
  status: string;
  tier: string;
  user_id: string | null;
  created_at: string;
}

type Tab = "logs" | "funnel";

const AdminPayments = () => {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("logs");
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("payment_logs").select("*").order("created_at", { ascending: false });
    setRows((data as PaymentRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && filter !== "premium" && r.status !== filter) return false;
      if (filter === "premium" && r.tier !== "premium") return false;
      const q = search.toLowerCase();
      if (q && !(r.razorpay_payment_id?.toLowerCase().includes(q) || r.display_name?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, filter]);

  const summary = useMemo(() => {
    const total = rows.length;
    const revenue = rows.reduce((s, r) => s + (r.amount ?? 0), 0);
    const success = rows.filter((r) => r.status === "success").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const flagged = rows.filter((r) => r.status === "flagged").length;
    return { total, revenue, success, failed, flagged };
  }, [rows]);

  const flag = async (r: PaymentRow) => {
    await supabase.from("payment_logs").update({ status: "flagged" }).eq("id", r.id);
    await logAdminAction("Flagged payment", r.razorpay_payment_id ?? r.id);
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "flagged" } : x)));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Payments</h1>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setTab("logs")} className={`px-3 py-1 ${tab === "logs" ? "bg-[#f59e0b] text-black" : "bg-[#161b22]"}`}>Logs</button>
          <button onClick={() => setTab("funnel")} className={`px-3 py-1 ${tab === "funnel" ? "bg-[#f59e0b] text-black" : "bg-[#161b22]"}`}>Funnel</button>
        </div>
      </div>

      {tab === "logs" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <div className="bg-[#161b22] border border-[#30363d] p-3"><div className="text-xs text-[#7d8590]">Total</div><div className="font-bold">{summary.total}</div></div>
            <div className="bg-[#161b22] border border-[#30363d] p-3"><div className="text-xs text-[#7d8590]">Revenue</div><div className="font-bold">₹{summary.revenue}</div></div>
            <div className="bg-[#161b22] border border-[#30363d] p-3"><div className="text-xs text-[#7d8590]">Success</div><div className="font-bold text-[#22c55e]">{summary.success}</div></div>
            <div className="bg-[#161b22] border border-[#30363d] p-3"><div className="text-xs text-[#7d8590]">Failed</div><div className="font-bold text-[#ef4444]">{summary.failed}</div></div>
            <div className="bg-[#161b22] border border-[#30363d] p-3"><div className="text-xs text-[#7d8590]">Flagged</div><div className="font-bold text-[#f59e0b]">{summary.flagged}</div></div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payment id / name" className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm">
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="flagged">Flagged</option>
              <option value="premium">Premium Only</option>
            </select>
          </div>

          <div className="overflow-x-auto bg-[#161b22] border border-[#30363d]">
            <table className="w-full text-sm">
              <thead className="bg-[#0d1117] text-xs text-[#7d8590]">
                <tr>
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Payment ID</th>
                  <th className="px-2 py-2 text-left">User</th>
                  <th className="px-2 py-2 text-left">Amount</th>
                  <th className="px-2 py-2 text-left">Tier</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Date</th>
                  <th className="px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-t border-[#30363d] hover:bg-[#1c2128]">
                    <td className="px-2 py-2 text-[#7d8590]">{i + 1}</td>
                    <td className="px-2 py-2 font-mono text-xs">{r.razorpay_payment_id ?? "—"}</td>
                    <td className="px-2 py-2">{r.display_name ?? "—"}</td>
                    <td className="px-2 py-2">₹{r.amount}</td>
                    <td className="px-2 py-2">{r.tier === "premium" ? <span className="text-[#f59e0b]">💎</span> : "—"}</td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 ${r.status === "success" ? "bg-[#22c55e] text-black" : r.status === "failed" ? "bg-[#ef4444] text-white" : "bg-[#f59e0b] text-black"}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs">{format(new Date(r.created_at), "MMM d, HH:mm")}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => flag(r)} title="Flag" className="px-2 py-1 text-xs bg-[#f59e0b] text-black">🚩</button>
                        {r.razorpay_payment_id && (
                          <a href={`https://dashboard.razorpay.com/app/payments/${r.razorpay_payment_id}`} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-[#0d1117] border border-[#30363d]">🔗</a>
                        )}
                        {r.display_name && (
                          <button onClick={() => nav(`/admin/users?highlight=${encodeURIComponent(r.display_name!)}`)} className="px-2 py-1 text-xs bg-[#0d1117] border border-[#30363d]">👤</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-[#7d8590]">No payments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <FunnelChart />
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
