import { motion } from "framer-motion";

export const QuestLoader = ({ label = "Loading quest…" }: { label?: string }) => (
  <div className="min-h-[50vh] w-full flex flex-col items-center justify-center gap-4">
    <motion.div
      className="text-5xl"
      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      🦉
    </motion.div>
    <motion.p
      className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {label}
    </motion.p>
  </div>
);

export default QuestLoader;
