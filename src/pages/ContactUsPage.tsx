import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Clock, MessageSquare, Zap, ExternalLink } from "lucide-react";
import PageShell from "@/components/PageShell";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const FAQS = [
  {
    q: "I paid ₹1 but my account wasn't activated. What do I do?",
    a: "First, try refreshing the page or logging out and back in. If the issue persists after 15 minutes, email us with your Razorpay Transaction ID. We'll manually verify and activate your account within 24–48 hours.",
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are available for duplicate charges or if payment was deducted but access was not granted. See our Refund Policy for full details and timelines.",
  },
  {
    q: "How do I earn more XP after the initial 100?",
    a: "You earn XP by referring friends using your unique referral code. Each successful referral who pays ₹1 adds XP to your account.",
  },
  {
    q: "How long does it take to get a response to my email?",
    a: "We respond to all queries within 24 to 48 hours on business days. For urgent payment issues, please mention 'URGENT' in your subject line.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card or UPI details on our servers.",
  },
];

const ContactUsPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageShell className="pb-0">
      <div className="w-full px-6 md:px-10 py-8 max-w-3xl mx-auto flex flex-col gap-10">

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
          className="flex flex-col items-center text-center gap-3 py-4"
        >
          <span className="text-6xl select-none" aria-hidden>🦉</span>
          <h1 className="font-display text-3xl md:text-4xl">Contact Us</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Got a question, payment issue, or just want to say hi? We're here.
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Email card */}
          <a
            href="mailto:bhupathi.dharmarao@outlook.com"
            id="contact-email-link"
            className="duo-card flex items-start gap-4 hover:border-accent/60 transition-colors group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                Email Support
              </div>
              <div className="text-sm text-accent font-semibold break-all">
                bhupathi.dharmarao@outlook.com
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <ExternalLink className="h-3 w-3" />
                Opens your email client
              </div>
            </div>
          </a>

          {/* Response time card */}
          <div className="duo-card flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                Response Time
              </div>
              <div className="text-sm font-semibold text-foreground">
                Within 24–48 hours
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                For all support and transaction queries
              </div>
            </div>
          </div>

          {/* Address card */}
          <div className="duo-card flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                Registered Address
              </div>
              <div className="text-sm font-semibold text-foreground leading-relaxed">
                BHUPATI DARMARAO<br />
                Shanti Nagar, Ramanthapur<br />
                Hyderabad, Telangana — 500013<br />
                India
              </div>
            </div>
          </div>

          {/* Delivery card */}
          <div className="duo-card flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                Digital Delivery
              </div>
              <div className="text-sm font-semibold text-foreground">
                Instant upon payment
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Access unlocked via Razorpay callback
              </div>
            </div>
          </div>
        </motion.div>

        {/* How to reach us */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="duo-card flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg">How to Reach Us</h2>
          </div>
          <div className="h-px bg-border" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            The best way to reach us is via email. For payment or transaction issues, please
            include your <strong className="text-foreground">Razorpay Transaction ID</strong> in
            the subject line — this helps us resolve your issue faster.
          </p>
          <a
            href="mailto:bhupathi.dharmarao@outlook.com?subject=Support%20Request%20—%20%5BTransaction%20ID%5D"
            id="contact-email-cta"
            className="duo-btn duo-btn-accent w-full sm:w-auto text-sm"
          >
            <Mail className="h-4 w-4" />
            Send us an Email
          </a>
        </motion.div>

        {/* FAQ section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-col gap-4 pb-10"
        >
          <h2 className="font-display text-2xl">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="duo-card !p-0 overflow-hidden">
                <button
                  id={`faq-toggle-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-semibold text-sm text-foreground leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className={`text-muted-foreground text-lg leading-none shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Still have a question?{" "}
            <a href="mailto:bhupathi.dharmarao@outlook.com" className="text-accent hover:underline">
              Email us directly.
            </a>
          </p>
        </motion.div>
      </div>

      <SiteFooter />
    </PageShell>
  );
};

export default ContactUsPage;
