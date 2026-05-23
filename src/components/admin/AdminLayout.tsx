import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/lib/sound";

const NAV = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/users", label: "👥 Users" },
  { to: "/admin/payments", label: "💳 Payments" },
  { to: "/admin/settings", label: "⚙ Settings" },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const { play } = useSound();
  const [open, setOpen] = useState(false);

  const logout = async () => { await signOut(); play("whoosh"); nav("/", { replace: true }); };

  return (
    <div className="min-h-screen text-foreground">
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card border-b-2 border-border">
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="text-gold">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="font-display text-sm text-gold flex items-center gap-1"><Shield size={14}/> ADMIN</span>
        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
      </div>

      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} md:block fixed md:static z-20 w-[240px] min-h-[calc(100vh-3.5rem)] md:min-h-screen bg-card border-r-2 border-border flex-col`}>
          <div className="hidden md:flex items-center gap-2 px-5 py-5 border-b-2 border-border">
            <Shield className="text-gold" size={18} />
            <span className="font-display font-bold text-gold">ADMIN PANEL</span>
          </div>
          <nav className="p-3 flex-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                onClick={() => { setOpen(false); play("click"); }}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-bold mb-1 rounded-xl border-l-4 transition-colors ${
                    isActive ? "bg-background-soft border-gold text-gold" : "border-transparent text-foreground hover:bg-background-soft"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="w-full text-left flex items-center gap-2 px-5 py-4 text-sm border-t-2 border-border text-destructive hover:bg-background-soft">
            <LogOut size={14} /> Logout
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="hidden md:flex items-center justify-end gap-3 px-6 h-14 border-b-2 border-border bg-card">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <span className="duo-chip bg-gold/20 text-gold">Admin</span>
          </div>
          <div className="p-4 md:p-6 pb-32">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
