import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface Props {
  to: number;
  from?: number;
  duration?: number; // ms
  className?: string;
  format?: (n: number) => string;
}

const CountUp = ({ to, from = 0, duration = 1200, className, format }: Props) => {
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { stiffness: 60, damping: 18, duration: duration / 1000 });
  const display = useTransform(spring, (v) => {
    const n = Math.round(v);
    return format ? format(n) : n.toLocaleString("en-IN");
  });

  useEffect(() => { mv.set(to); }, [to, mv]);

  return <motion.span className={className}>{display}</motion.span>;
};

export default CountUp;
