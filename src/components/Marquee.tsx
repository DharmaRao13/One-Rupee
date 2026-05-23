interface Props {
  items: string[];
  className?: string;
}

const Marquee = ({ items, className = "" }: Props) => {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y border-hairline py-3 ${className}`}>
      <div className="marquee-track flex items-center gap-10 whitespace-nowrap text-xs md:text-sm uppercase tracking-[0.25em] text-primary/80">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="text-primary/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
