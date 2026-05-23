import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageTransition, pageVariants } from "@/lib/motion";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Wraps page content with consistent enter animation and centered layout. */
export const PageShell = ({ children, className = "" }: PageShellProps) => {
  const { pathname } = useLocation();
  return (
    <motion.main
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={`w-full min-h-screen flex flex-col items-center ${className}`}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center">
        {children}
      </div>
    </motion.main>
  );
};

export default PageShell;
