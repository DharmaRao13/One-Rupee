import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/admin/StatCard";
import ActivityLog from "@/components/admin/ActivityLog";
import DailyChart from "@/components/admin/DailyChart";
import FunnelChart from "@/components/admin/FunnelChart";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  total: number;
  verified: number;
  blocked: number;
  revenue: number;
  premium: number;
  premiumRevenue: number;
  totalReferrals: number;
}

interface RecentRow {
  id: string;
  display_name: string;
  created_at: string;
  is_verified: boolean;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("users_ledger")
        .select("amount_paid, is_verified, is_blocked, tier, referral_count");
      const list = rows ?? [];
      const total = list.length;
      const verified = list.filter((r: any) => r.is_verified).length;
      const blocked = list.filter((r: any) => r.is_blocked).length;
      const revenue = list.reduce((s: number, r: any) => s + (r.amount_paid ?? 0), 0);
      const premium = list.filter((r: any) => r.tier === "premium").length;
      const premiumRevenue = premium * 5;
      const totalReferrals = list.reduce((s: number, r: any) => s + (r.referral_count ?? 0), 0);
      setStats({ total, verified, blocked, revenue, premium, premiumRevenue, totalReferrals });

      const { data: r2 } = await supabase
        .from("users_ledger")
        .select("id, display_name, created_at, is_verified")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent((r2 as RecentRow[]) ?? []);
    })();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Payers" value={stats?.total ?? 0} />
        <StatCard label="Verified" value={stats?.verified ?? 0} />
        <StatCard label="Blocked" value={stats?.blocked ?? 0} />
        <StatCard label="Revenue" value={`₹${stats?.revenue ?? 0}`} />
        <StatCard label="Premium Members" value={stats?.premium ?? 0} />
        <StatCard label="Premium Revenue" value={`₹${stats?.premiumRevenue ?? 0}`} />
        <StatCard label="Total Referrals" value={stats?.totalReferrals ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-[#161b22] border border-[#30363d] p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#f59e0b] mb-3" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            Recent Joiners
          </h3>
          {recent.length === 0 ? (
            <div className="text-sm text-[#7d8590]">No members yet.</div>
          ) : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm border-b border-[#30363d] pb-2 last:border-b-0">
                  <span>{r.display_name}</span>
                  <span className="flex items-center gap-2 text-xs text-[#7d8590]">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    {r.is_verified ? <span className="text-[#22c55e]">✓</span> : <span className="text-[#ef4444]">✗</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ActivityLog limit={10} />
      </div>

      <div className="mt-6 grid gap-4">
        <DailyChart />
        <FunnelChart />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
