import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { fetchSiteStats } from "@/lib/api";
import { useEffect, useState } from "react";
import CountUp from "@/components/CountUp";

/** Animated gold ₹1 coin SVG — replaces the old Lovable owl logo */
const GoldCoinLogo = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="₹1 gold coin"
  >
    <defs>
      {/* Main coin face gradient — warm gold with depth */}
      <radialGradient id="coinFace" cx="36%" cy="28%" r="68%" fx="36%" fy="28%">
        <stop offset="0%"   stopColor="#FFF0A0" />
        <stop offset="25%"  stopColor="#FFD700" />
        <stop offset="60%"  stopColor="#FFB300" />
        <stop offset="100%" stopColor="#A0620A" />
      </radialGradient>
      {/* Edge / rim gradient — darker gold */}
      <radialGradient id="coinEdge" cx="50%" cy="50%" r="50%">
        <stop offset="75%"  stopColor="#B8730A" stopOpacity="0"   />
        <stop offset="100%" stopColor="#7A4A00" stopOpacity="0.8" />
      </radialGradient>
      {/* Specular shimmer on top-left */}
      <radialGradient id="coinShimmer" cx="28%" cy="22%" r="42%">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
      </radialGradient>
      {/* Drop shadow filter */}
      <filter id="coinShadow" x="-15%" y="-10%" width="130%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#7A4A00" floodOpacity="0.5" />
      </filter>
    </defs>

    {/* Coin body */}
    <circle cx="28" cy="27" r="25" fill="url(#coinFace)" filter="url(#coinShadow)" />

    {/* Rim darkening ring */}
    <circle cx="28" cy="27" r="25" fill="url(#coinEdge)" />

    {/* Inner engraved ring */}
    <circle cx="28" cy="27" r="20" fill="none" stroke="#C8860A" strokeWidth="1" strokeOpacity="0.7" />

    {/* Specular highlight */}
    <circle cx="28" cy="27" r="25" fill="url(#coinShimmer)" />

    {/* Rupee ₹ symbol — centre stage */}
    <text
      x="28" y="31"
      textAnchor="middle"
      fontFamily="'Fredoka', 'Nunito', Georgia, serif"
      fontWeight="700"
      fontSize="22"
      fill="#6B3C00"
      letterSpacing="-0.5"
    >₹</text>

    {/* "1" sub-label at bottom of inner ring */}
    <text
      x="28" y="44"
      textAnchor="middle"
      fontFamily="'Fredoka', 'Nunito', sans-serif"
      fontWeight="700"
      fontSize="7"
      fill="#7A4A00"
      letterSpacing="1.5"
    >ONE</text>
  </svg>
);

/** Centered top brand bar — visible on all pages except /auth */
export const SiteHeader = () => {
  const { isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchSiteStats().then((s) => setCount(s.total_payers));
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full flex justify-center pt-5 px-4 pb-2"
    >
      <Link
        to={isAdmin ? "/leaderboard" : "/"}
        className="inline-flex flex-col items-center gap-1 text-center group"
      >
        <motion.div
          animate={{ rotateY: [0, 20, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <GoldCoinLogo />
        </motion.div>
        <span className="font-display text-sm md:text-base tracking-tight group-hover:text-primary transition-colors">
          The ₹1 Quest
        </span>
        <span className="duo-chip bg-primary/15 text-primary text-[10px]">
          <CountUp to={count} /> legends live
        </span>
      </Link>
    </motion.header>
  );
};

export default SiteHeader;
