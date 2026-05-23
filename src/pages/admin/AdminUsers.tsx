import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/adminLog";
import { formatDistanceToNow } from "date-fns";

interface UserRow {
  id: string;
  display_name: string;
  payment_id: string | null;
  amount_paid: number;
  is_verified: boolean;
  is_blocked: boolean;
  notes: string | null;
  created_at: string;
  tier: string;
  badges: string[] | null;
  referral_count: number | null;
}

type Filter = "all" | "verified" | "blocked" | "unverified";
type SortKey = keyof UserRow;

const AdminUsers = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const PER_PAGE = 20;

  const load = async () => {
    const { data } = await supabase.from("users_ledger").select("*").order("created_at", { ascending: false });
    setRows((data as UserRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let out = rows.filter((r) => r.display_name.toLowerCase().includes(search.toLowerCase()));
    if (filter === "verified") out = out.filter((r) => r.is_verified);
    if (filter === "blocked") out = out.filter((r) => r.is_blocked);
    if (filter === "unverified") out = out.filter((r) => !r.is_verified);
    out = [...out].sort((a, b) => {
      const va: any = a[sortKey] ?? "";
      const vb: any = b[sortKey] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, search, filter, sortKey, sortDir]);

  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const updateRow = async (id: string, patch: Partial<UserRow>) => {
    const { error } = await supabase.from("users_ledger").update(patch).eq("id", id);
    if (!error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } as UserRow : r)));
  };

  const toggleVerify = async (r: UserRow) => {
    await updateRow(r.id, { is_verified: !r.is_verified });
    await logAdminAction(r.is_verified ? "Unverified user" : "Verified user", r.display_name);
  };
  const toggleBlock = async (r: UserRow) => {
    await updateRow(r.id, { is_blocked: !r.is_blocked });
    await logAdminAction(r.is_blocked ? "Unblocked user" : "Blocked user", r.display_name);
  };
  const saveNote = async (r: UserRow, note: string) => {
    if (note === (r.notes ?? "")) return;
    await updateRow(r.id, { notes: note });
    await logAdminAction("Updated note", r.display_name);
  };
  const remove = async (r: UserRow) => {
    if (!confirm(`Delete ${r.display_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("users_ledger").delete().eq("id", r.id);
    if (error) return;
    // decrement total_payers
    const { data: stats } = await supabase.from("site_stats").select("total_payers").eq("id", 1).maybeSingle();
    const next = Math.max(0, (stats?.total_payers ?? 1) - 1);
    await supabase.from("site_stats").update({ total_payers: next }).eq("id", 1);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    await logAdminAction("Deleted user", r.display_name);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const bulk = async (kind: "delete" | "block" | "verify") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (kind === "delete" && !confirm(`Delete ${ids.length} users?`)) return;
    if (kind === "delete") {
      await supabase.from("users_ledger").delete().in("id", ids);
      const { data: stats } = await supabase.from("site_stats").select("total_payers").eq("id", 1).maybeSingle();
      const next = Math.max(0, (stats?.total_payers ?? ids.length) - ids.length);
      await supabase.from("site_stats").update({ total_payers: next }).eq("id", 1);
      await logAdminAction("Bulk deleted", `${ids.length} users`);
    } else if (kind === "block") {
      await supabase.from("users_ledger").update({ is_blocked: true }).in("id", ids);
      await logAdminAction("Bulk blocked", `${ids.length} users`);
    } else {
      await supabase.from("users_ledger").update({ is_verified: true }).in("id", ids);
      await logAdminAction("Bulk verified", `${ids.length} users`);
    }
    setSelected(new Set());
    load();
  };

  const exportCsv = () => {
    const cols = ["id", "display_name", "payment_id", "amount_paid", "is_verified", "is_blocked", "tier", "referral_count", "created_at", "notes"];
    const lines = [cols.join(",")];
    for (const r of rows) {
      lines.push(cols.map((c) => JSON.stringify((r as any)[c] ?? "")).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const Th = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th className="px-2 py-2 text-left text-xs uppercase tracking-wider text-[#7d8590] cursor-pointer select-none" onClick={() => toggleSort(k)}>
      {children}{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </th>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Users</h1>
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name…" className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm" />
          <select value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setPage(1); }} className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-sm">
            <option value="all">All</option><option value="verified">Verified</option><option value="blocked">Blocked</option><option value="unverified">Unverified</option>
          </select>
          <button onClick={exportCsv} className="bg-[#f59e0b] text-black px-3 py-1 text-xs font-bold">Export CSV</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bg-[#161b22] border border-[#f59e0b] p-2 mb-3 flex items-center gap-2 text-sm">
          <span>{selected.size} selected</span>
          <button onClick={() => bulk("verify")} className="bg-[#22c55e] text-black px-2 py-1 text-xs font-bold">Verify</button>
          <button onClick={() => bulk("block")} className="bg-[#f59e0b] text-black px-2 py-1 text-xs font-bold">Block</button>
          <button onClick={() => bulk("delete")} className="bg-[#ef4444] text-white px-2 py-1 text-xs font-bold">Delete</button>
        </div>
      )}

      <div className="overflow-x-auto bg-[#161b22] border border-[#30363d]">
        <table className="w-full text-sm">
          <thead className="bg-[#0d1117]">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              <th className="px-2 py-2 text-left text-xs text-[#7d8590]">#</th>
              <Th k="display_name">Name</Th>
              <Th k="payment_id">Payment ID</Th>
              <Th k="amount_paid">Amt</Th>
              <Th k="tier">Tier</Th>
              <Th k="referral_count">Refs</Th>
              <Th k="is_verified">Verified</Th>
              <Th k="is_blocked">Blocked</Th>
              <Th k="created_at">Joined</Th>
              <th className="px-2 py-2 text-left text-xs text-[#7d8590]">Badges</th>
              <th className="px-2 py-2 text-left text-xs text-[#7d8590]">Notes</th>
              <th className="px-2 py-2 text-left text-xs text-[#7d8590]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={r.id}
                  className={`border-t border-[#30363d] ${r.is_blocked ? "bg-[#3a0e0e]" : !r.is_verified ? "bg-[#3a2a0e]" : ""} ${r.tier === "premium" ? "bg-[#2a1f0a]" : ""} hover:bg-[#1c2128]`}>
                <td className="px-2 py-2"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                <td className="px-2 py-2 text-[#7d8590]">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="px-2 py-2">
                  {r.display_name}
                  {r.is_blocked && <span className="ml-2 text-[10px] bg-[#ef4444] text-white px-1">BLOCKED</span>}
                  {!r.is_verified && <span className="ml-2 text-[10px] bg-[#f59e0b] text-black px-1">UNVERIFIED</span>}
                </td>
                <td className="px-2 py-2 text-xs font-mono text-[#7d8590]">{r.payment_id ?? "—"}</td>
                <td className="px-2 py-2">₹{r.amount_paid}</td>
                <td className="px-2 py-2">{r.tier === "premium" ? <span className="text-[#f59e0b]">💎 Premium</span> : "Standard"}</td>
                <td className="px-2 py-2 tabular-nums">{r.referral_count ?? 0}</td>
                <td className="px-2 py-2">{r.is_verified ? "✓" : "✗"}</td>
                <td className="px-2 py-2">{r.is_blocked ? "🚫" : "—"}</td>
                <td className="px-2 py-2 text-xs">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</td>
                <td className="px-2 py-2 text-xs">{r.badges?.length ?? 0}</td>
                <td className="px-2 py-2">
                  <input
                    defaultValue={r.notes ?? ""}
                    onBlur={(e) => saveNote(r, e.target.value)}
                    placeholder="Add note…"
                    className="bg-[#0d1117] border border-[#30363d] px-2 py-1 text-xs w-32"
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => toggleVerify(r)} title="Verify" className="px-2 py-1 text-xs bg-[#22c55e] text-black">✓</button>
                    <button onClick={() => toggleBlock(r)} title="Block" className="px-2 py-1 text-xs bg-[#f59e0b] text-black">🚫</button>
                    <button onClick={() => remove(r)} title="Delete" className="px-2 py-1 text-xs bg-[#ef4444] text-white">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={13} className="px-3 py-8 text-center text-[#7d8590]">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-[#7d8590]">
        <span>{filtered.length} users</span>
        <div className="flex gap-2 items-center">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 border border-[#30363d] disabled:opacity-30">Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border border-[#30363d] disabled:opacity-30">Next</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
