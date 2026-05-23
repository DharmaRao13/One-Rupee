/** Shared Framer Motion presets for sitewide gamified UX */
import type { Variants, Transition } from "framer-motion";

export const spring: Transition = { type: "spring", stiffness: 320, damping: 28 };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
};

export const pageTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: spring },
};

export const cardHover = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: spring,
};

export const floatLoop = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
};
