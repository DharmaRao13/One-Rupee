import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Zap, Trophy, Shield, LayoutDashboard, Users, CreditCard,
  Settings, LogIn, LogOut, Volume2, VolumeX,
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useSound } from "@/lib/sound";

const publicItems = [
  { to: "/",           label: "Home",  icon: Home,          exact: true },
  { to: "/pay",        label: "Quest", icon: Zap                        },
  { to: "/leaderboard",label: "Wall",  icon: Trophy                     },
];

const adminItems = [
  { to: "/admin",          label: "Dash",  icon: LayoutDashboard, exact: true },
  { to: "/admin/users",    label: "Users", icon: Users                        },
  { to: "/admin/payments", label: "Pay",   icon: CreditCard                   },
  { to: "/admin/settings", label: "Set",   icon: Settings                     },
];

export const DynamicIslandNav = () => {
  const loc = useLocation();
  const nav = useNavigate();
  const { session, isAdmin, signOut } = useAuth();
  const { muted, toggle, play } = useSound();
  const onAdminRoute = loc.pathname.startsWith("/admin");
  if (loc.pathname === "/auth") return null;

  const items = onAdminRoute ? adminItems : publicItems;

  const isActive = (to: string, exact?: boolean) => {
    if (exact || to === "/") return loc.pathname === to;
    return loc.pathname === to || loc.pathname.startsWith(to + "/");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-4 md:pb-6 px-3">
      <motion.nav
        aria-label="Primary"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.15 }}
        className="pointer-events-auto w-full max-w-lg mx-auto px-2 py-2 rounded-[2rem] bg-card/95 backdrop-blur-md border-2 border-b-4 border-border shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      >
        <LayoutGroup>
          <ul className="flex items-center justify-center gap-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const exact = (item as { exact?: boolean }).exact;
              const active = isActive(item.to, exact);
              return (
                <li key={item.to} className="relative">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Link
                    to={item.to}
                    onClick={() => play("click")}
                    aria-current={active ? "page" : undefined}
                    className={`relative z-10 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors min-w-[44px] ${
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            <li className="w-px h-7 bg-border mx-0.5 shrink-0" aria-hidden />

            <li>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggle}
                aria-label={muted ? "Unmute" : "Mute"}
                className="p-2.5 rounded-full text-muted-foreground hover:text-gold transition-colors"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </motion.button>
            </li>

            {isAdmin && !onAdminRoute && (
              <li>
                <Link
                  to="/admin"
                  onClick={() => play("click")}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-full text-xs font-bold uppercase text-gold"
                >
                  <Shield size={18} />
                </Link>
              </li>
            )}

            <li>
              {session ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={async () => { await signOut(); play("whoosh"); nav("/"); }}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut size={18} />
                </motion.button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => play("click")}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-full text-accent font-bold uppercase text-xs"
                >
                  <LogIn size={18} />
                </Link>
              )}
            </li>
          </ul>
        </LayoutGroup>
      </motion.nav>
    </div>
  );
};

export default DynamicIslandNav;
