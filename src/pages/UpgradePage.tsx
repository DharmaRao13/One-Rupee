import { Navigate, useNavigate } from "react-router-dom";
import { getSS, SS } from "@/lib/session";

const UpgradePage = () => {
  const nav = useNavigate();
  const registered = getSS(SS.userRegistered) === "true";
  if (!registered) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 pb-32 bg-background-soft text-foreground">
      <div className="duo-card w-full max-w-md text-center">
        <div className="text-6xl mb-3 bounce-soft">💎</div>
        <h1 className="text-2xl md:text-3xl font-display">
          Premium <span className="text-accent">coming soon</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We're crafting golden names, exclusive badges, and more XP perks.
        </p>
        <button onClick={() => nav("/leaderboard")} className="mt-6 duo-btn duo-btn-primary w-full">
          ← BACK TO THE WALL
        </button>
      </div>
    </div>
  );
};

export default UpgradePage;
