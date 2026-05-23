import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";

interface PolicyShellProps {
  icon: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

/** Shared layout for all legal/policy pages — consistent typography and structure. */
export const PolicyShell = ({
  icon,
  title,
  subtitle,
  lastUpdated,
  children,
}: PolicyShellProps) => {
  return (
    <PageShell className="pb-0">
      <div className="w-full px-6 md:px-10 py-8 flex flex-col gap-8 max-w-3xl mx-auto">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center gap-3 py-6"
        >
          <span className="text-6xl select-none" aria-hidden>{icon}</span>
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          <p className="text-muted-foreground text-sm max-w-md">{subtitle}</p>
          <span className="duo-chip bg-border text-muted-foreground text-[10px]">
            Last updated: {lastUpdated}
          </span>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-border" />

        {/* Policy body */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="prose-policy flex flex-col gap-8 pb-12"
        >
          {children}
        </motion.article>
      </div>

      <SiteFooter />
    </PageShell>
  );
};

/** A numbered/titled section within a policy page */
export const PolicySection = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
        {number}
      </div>
      <h2 className="font-display text-lg md:text-xl">{title}</h2>
    </div>
    <div className="ml-10 flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

/** A highlighted info box (used for key legal facts) */
export const PolicyHighlight = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "warning" | "success";
}) => {
  const styles = {
    default: "bg-accent/10 border-accent/30 text-accent",
    warning: "bg-gold/10 border-gold/30 text-gold",
    success: "bg-primary/10 border-primary/30 text-primary",
  };
  return (
    <div className={`rounded-2xl border-2 px-5 py-4 text-sm font-semibold leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
};

export default PolicyShell;
