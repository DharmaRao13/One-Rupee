import { forwardRef } from "react";
import { BadgeRow } from "./BadgePill";

interface Props {
  rank: number;
  total: number;
  displayName: string;
  badges?: string[];
}

export const RankCard = forwardRef<HTMLDivElement, Props>(
  ({ rank, total, displayName, badges }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full max-w-[540px] aspect-[1080/608] rounded-2xl border-4 border-primary overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)",
          fontFamily: '"Nunito", sans-serif',
        }}
      >
        <div className="relative h-full p-6 md:p-8 flex flex-col justify-between text-white">
          <div className="text-xs uppercase tracking-widest font-bold opacity-90">
            🦉 The ₹1 Quest
          </div>

          <div>
            <div className="font-extrabold leading-none drop-shadow-md" style={{ fontSize: "clamp(72px, 18vw, 140px)" }}>
              #{rank}
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-bold truncate">{displayName}</div>
            <div className="text-sm md:text-base opacity-90">
              of {total.toLocaleString("en-IN")} legends
            </div>
            {badges && badges.length > 0 && (
              <div className="mt-3"><BadgeRow badges={badges} max={3} /></div>
            )}
          </div>

          <div className="flex items-end justify-between text-xs font-bold">
            <span className="opacity-80">{typeof window !== "undefined" ? window.location.host : ""}</span>
            <span>✓ Verified</span>
          </div>
        </div>
      </div>
    );
  }
);
RankCard.displayName = "RankCard";
export default RankCard;
