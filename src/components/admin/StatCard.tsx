interface Props {
  label: string;
  value: string | number;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: Props) => (
  <div className="bg-[#161b22] border border-[#30363d] border-l-2 border-l-[#f59e0b] p-4 md:p-5">
    <div className="text-3xl md:text-4xl font-bold tabular-nums" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {value}
    </div>
    <div className="mt-1 text-xs uppercase tracking-widest text-[#7d8590]">{label}</div>
    {hint && <div className="mt-1 text-xs text-[#7d8590]">{hint}</div>}
  </div>
);

export default StatCard;
