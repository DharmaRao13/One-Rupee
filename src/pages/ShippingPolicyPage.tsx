import PolicyShell, { PolicySection, PolicyHighlight } from "@/components/PolicyShell";
import { Zap } from "lucide-react";

const ShippingPolicyPage = () => (
  <PolicyShell
    icon="🚀"
    title="Shipping Policy"
    subtitle="How and when we deliver your digital access after payment."
    lastUpdated="23 May 2025"
  >
    <PolicyHighlight variant="success">
      <span className="flex items-center gap-2 flex-wrap">
        <Zap className="h-4 w-4 shrink-0" />
        <span>
          <strong>All deliveries are instant and digital.</strong> The ₹1 Quest platform
          operated by <strong>BHUPATI DARMARAO</strong> does not ship any physical goods.
          There is no physical delivery, courier, or postal dispatch of any kind.
        </span>
      </span>
    </PolicyHighlight>

    <PolicySection number={1} title="Nature of the Product — Digital Only">
      <p>
        The ₹1 Quest is a <strong>100% digital platform</strong>. Upon successful payment, users
        receive exclusively digital deliverables:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Access to the Wall of Legends (public leaderboard).</li>
        <li>100 XP credited to the user's dashboard.</li>
        <li>A unique referral code for sharing.</li>
        <li>Full participation rights including badges, rank upgrades, and leaderboard visibility.</li>
      </ul>
      <p className="mt-2">
        Since the product is entirely digital and accessed through a web browser, no shipping,
        packaging, or physical logistics are involved in any transaction on this platform.
      </p>
    </PolicySection>

    <PolicySection number={2} title="Delivery Timeframe — Instant">
      <div className="duo-card !py-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-2xl">
            ⚡
          </div>
          <div>
            <div className="font-display text-base text-foreground">Delivery Time: Instant</div>
            <div className="text-xs text-muted-foreground">Upon Razorpay payment confirmation</div>
          </div>
        </div>
        <div className="w-full h-px bg-border" />
        <p className="text-sm">
          Digital access is granted <strong>immediately</strong> upon a successful Razorpay
          payment callback. Specifically:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            The moment Razorpay confirms your payment, our system receives a webhook notification
            and instantly activates your account.
          </li>
          <li>
            Your XP, leaderboard position, and referral code are available on your dashboard
            within <strong>seconds</strong> of payment completion.
          </li>
          <li>
            No manual processing, approval, or waiting period is required.
          </li>
        </ul>
      </div>
    </PolicySection>

    <PolicySection number={3} title="Delivery Failure — What Happens">
      <p>
        In rare cases, due to network issues or payment gateway timeouts, your account may not be
        activated immediately. If you complete payment but do not see your access unlocked within
        <strong> 15 minutes</strong> of the transaction:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>
          First, try refreshing your dashboard or logging out and back in — this resolves most
          edge cases.
        </li>
        <li>
          If the issue persists, email us at{" "}
          <a href="mailto:bhupathi.dharmarao@outlook.com" className="text-accent hover:underline">
            bhupathi.dharmarao@outlook.com
          </a>{" "}
          with your Razorpay Transaction ID.
        </li>
        <li>
          We will manually verify and activate your account within{" "}
          <strong>24–48 hours</strong> of receiving your query.
        </li>
      </ul>
    </PolicySection>

    <PolicySection number={4} title="Access Availability">
      <p>
        Once your digital access is activated, it is permanent and does not expire. Your place on
        the Wall of Legends and your XP balance are retained indefinitely as long as your account
        is in good standing and compliant with our Terms &amp; Conditions.
      </p>
      <p className="mt-2">
        Platform availability is subject to scheduled maintenance, which we will announce in
        advance where possible. Temporary downtime during maintenance does not constitute a
        failure of delivery.
      </p>
    </PolicySection>

    <PolicySection number={5} title="No Physical Shipping — Explicit Declaration">
      <PolicyHighlight variant="default">
        <strong>For absolute clarity:</strong> BHUPATI DARMARAO does not ship any physical goods,
        products, merchandise, or tangible items to any address. This platform is entirely digital.
        This Shipping Policy exists solely to confirm the nature and timeline of digital delivery,
        as required by Razorpay's merchant compliance standards.
      </PolicyHighlight>
    </PolicySection>

    <PolicySection number={6} title="Contact">
      <p>
        For any delivery-related queries, contact us at:
      </p>
      <div className="mt-2 duo-card text-sm space-y-1 !py-4">
        <p><strong className="text-foreground">Name:</strong> BHUPATI DARMARAO</p>
        <p>
          <strong className="text-foreground">Email:</strong>{" "}
          <a href="mailto:bhupathi.dharmarao@outlook.com" className="text-accent hover:underline">
            bhupathi.dharmarao@outlook.com
          </a>
        </p>
        <p><strong className="text-foreground">Address:</strong> Shanti Nagar, Ramanthapur, Hyderabad, Telangana — 500013</p>
        <p><strong className="text-foreground">Response Time:</strong> Within 24–48 hours for all support and transaction queries</p>
      </div>
    </PolicySection>
  </PolicyShell>
);

export default ShippingPolicyPage;
