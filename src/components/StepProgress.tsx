import { motion } from "framer-motion";

interface Props {
  steps: string[];
  current: number;
}

const StepProgress = ({ steps, current }: Props) => {
  const pct = (current / Math.max(steps.length - 1, 1)) * 100;
  return (
    <div className="w-full">
      <div className="relative h-3 bg-background-soft border-2 border-border rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full xp-bar-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-wider">
        {steps.map((s, i) => (
          <span key={s} className={i <= current ? "text-primary" : "text-muted-foreground"}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
