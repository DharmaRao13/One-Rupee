import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MapPin, Shield } from "lucide-react";

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Contact Us", to: "/contact-us" },
];

/** Global footer — legal compliance links for Razorpay merchant audit. */
export const SiteFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full border-t border-border mt-24"
      style={{ background: "hsl(var(--background-soft))" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            {/* Gold ₹1 coin logo (mini) */}
            <GoldCoinMini />
            <span className="font-display text-lg">The ₹1 Quest</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A social experiment in trust. Pay ₹1, earn XP, and join the wall
            of legends. Simple, fun, and transparent.
          </p>
          <div className="duo-chip bg-primary/15 text-primary w-fit text-[10px]">
            <Shield className="h-3 w-3" />
            Secured by Razorpay
          </div>
        </div>

        {/* Legal links column */}
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-1">
            Legal
          </h3>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-foreground/70 hover:text-primary transition-colors hover:underline underline-offset-4 w-fit"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact column */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-1">
            Contact
          </h3>
          <a
            href="mailto:bhupathi.dharmarao@outlook.com"
            className="flex items-start gap-2 text-sm text-foreground/70 hover:text-accent transition-colors group"
          >
            <Mail className="h-4 w-4 mt-0.5 shrink-0 group-hover:text-accent" />
            bhupathi.dharmarao@outlook.com
          </a>
          <div className="flex items-start gap-2 text-sm text-foreground/70">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Shanti Nagar, Ramanthapur,<br />
              Hyderabad, Telangana — 500013
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Support response: within 24–48 hours
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BHUPATI DARMARAO. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Be kind, have fun, see you on the wall. 🪙
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

/** Small gold coin used in the footer brand area */
const GoldCoinMini = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <radialGradient id="coinGradMini" cx="38%" cy="32%" r="65%" fx="38%" fy="32%">
        <stop offset="0%"   stopColor="#FFE066" />
        <stop offset="40%"  stopColor="#FFB800" />
        <stop offset="100%" stopColor="#B8730A" />
      </radialGradient>
      <radialGradient id="coinShimmerMini" cx="30%" cy="25%" r="50%">
        <stop offset="0%" stopColor="#FFFBEA" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFFBEA" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Outer coin body */}
    <circle cx="14" cy="14" r="13" fill="url(#coinGradMini)" />
    {/* Inner ring */}
    <circle cx="14" cy="14" r="10.5" fill="none" stroke="#B8730A" strokeWidth="0.8" strokeOpacity="0.6" />
    {/* Shimmer highlight */}
    <circle cx="14" cy="14" r="13" fill="url(#coinShimmerMini)" />
    {/* Rupee symbol */}
    <text
      x="14" y="18.5"
      textAnchor="middle"
      fontFamily="'Fredoka', 'Nunito', sans-serif"
      fontWeight="700"
      fontSize="12"
      fill="#7A4A00"
      letterSpacing="-0.5"
    >₹</text>
  </svg>
);

export default SiteFooter;
