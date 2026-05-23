import { BADGE_META, BadgeKey } from "@/lib/badges";

export const BadgePill = ({ badge }: { badge: BadgeKey }) => {
  const meta = BADGE_META[badge];
  if (!meta) return null;
  const isGradient = meta.bg.startsWith("linear-gradient");
  return (
    <span
      title={meta.description}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: meta.bg,
        color: meta.fg,
        backgroundImage: isGradient ? meta.bg : undefined,
      }}
    >
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  );
};

export const BadgeRow = ({ badges, max = 99 }: { badges?: string[] | null; max?: number }) => {
  if (!badges || badges.length === 0) return null;
  const shown = badges.slice(0, max) as BadgeKey[];
  const extra = badges.length - shown.length;
  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {shown.map((b) => (
        <BadgePill key={b} badge={b} />
      ))}
      {extra > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground">+{extra} more</span>
      )}
    </span>
  );
};
