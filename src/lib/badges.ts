export type BadgeKey =
  | "og_10"
  | "top_100"
  | "top_500"
  | "referrer_3"
  | "referrer_10"
  | "premium";

export const BADGE_META: Record<
  BadgeKey,
  { label: string; emoji: string; description: string; bg: string; fg: string }
> = {
  og_10: { label: "OG", emoji: "🔱", description: "First 10 members", bg: "#b8860b", fg: "#000" },
  top_100: { label: "Top 100", emoji: "🏆", description: "Ranked in top 100", bg: "#f59e0b", fg: "#000" },
  top_500: { label: "Top 500", emoji: "⭐", description: "Ranked in top 500", bg: "#6b7280", fg: "#fff" },
  referrer_3: { label: "Connector", emoji: "🔥", description: "Referred 3+ people", bg: "#fb923c", fg: "#000" },
  referrer_10: { label: "Legend", emoji: "👑", description: "Referred 10+ people", bg: "#7c3aed", fg: "#fff" },
  premium: { label: "Premium", emoji: "💎", description: "₹5 premium member", bg: "linear-gradient(135deg,#7c3aed,#3b82f6)", fg: "#fff" },
};

export function computeBadgesFor(rank: number, referralCount: number, isPremium: boolean): BadgeKey[] {
  const out: BadgeKey[] = [];
  if (rank <= 10) out.push("og_10");
  if (rank <= 100) out.push("top_100");
  if (rank <= 500) out.push("top_500");
  if (referralCount >= 3) out.push("referrer_3");
  if (referralCount >= 10) out.push("referrer_10");
  if (isPremium) out.push("premium");
  return out;
}
