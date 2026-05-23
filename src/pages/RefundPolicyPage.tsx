import PolicyShell, { PolicySection, PolicyHighlight } from "@/components/PolicyShell";

const RefundPolicyPage = () => (
  <PolicyShell
    icon="💸"
    title="Refund Policy"
    subtitle="Our policy on refunds, cancellations, and transaction disputes."
    lastUpdated="23 May 2025"
  >
    <PolicyHighlight variant="success">
      This Refund Policy applies to all payments made on the ₹1 Quest platform operated by{" "}
      <strong>BHUPATI DARMARAO</strong>. Please read this policy carefully before making a
      payment.
    </PolicyHighlight>

    <PolicySection number={1} title="Nature of the Transaction">
      <p>
        The ₹1 Quest charges a <strong>one-time, non-recurring token entry fee of ₹1
        (one Indian Rupee)</strong> per user account. This fee grants the user:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>Immediate, permanent access to the Wall of Legends leaderboard.</li>
        <li>100 XP credited instantly to their account.</li>
        <li>A unique referral code and full platform participation rights.</li>
      </ul>
      <p className="mt-2">
        Because digital access is granted <strong>immediately and irrevocably</strong> upon
        successful payment confirmation, the ₹1 entry fee is generally non-refundable.
        However, we outline specific refund conditions below.
      </p>
    </PolicySection>

    <PolicySection number={2} title="Refund Eligibility Conditions">
      <PolicyHighlight variant="success">
        ✅ You <strong>are eligible</strong> for a full refund (₹1) if:
      </PolicyHighlight>
      <ul className="list-disc pl-5 space-y-1 mt-3">
        <li>
          <strong className="text-foreground">Duplicate Payment:</strong> Your account was charged
          more than once due to a technical error or payment gateway timeout. You will receive a
          full refund for all duplicate charges.
        </li>
        <li>
          <strong className="text-foreground">Payment Deducted, Access Not Granted:</strong> Your
          payment was successfully deducted by Razorpay but your account was not activated or your
          XP was not credited within <strong>15 minutes</strong> of the transaction. In this case,
          contact us with your Transaction ID within 7 days of the payment.
        </li>
        <li>
          <strong className="text-foreground">Razorpay-Initiated Failure:</strong> Payment was
          debited but not confirmed/completed at Razorpay's end (i.e., a bank debit without a
          successful payment order). Banks typically auto-reverse such amounts within 5–7 business
          days. If it doesn't, contact us.
        </li>
      </ul>

      <div className="mt-4" />
      <PolicyHighlight variant="warning">
        ❌ You are <strong>not eligible</strong> for a refund if:
      </PolicyHighlight>
      <ul className="list-disc pl-5 space-y-1 mt-3">
        <li>
          Your account was successfully activated and you were granted access to the platform.
        </li>
        <li>You change your mind after completing a successful payment.</li>
        <li>
          You were suspended or banned from the platform due to a violation of our Terms &amp;
          Conditions.
        </li>
        <li>
          You made a payment using someone else's payment instrument without their consent (this
          may also constitute fraud).
        </li>
      </ul>
    </PolicySection>

    <PolicySection number={3} title="Refund Process &amp; Timelines">
      <p>
        To request a refund, email us at{" "}
        <a href="mailto:bhupathi.dharmarao@outlook.com" className="text-accent hover:underline">
          bhupathi.dharmarao@outlook.com
        </a>{" "}
        with the subject line <strong>"Refund Request — [Your Transaction ID]"</strong>. Include:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Your registered email address.</li>
        <li>Razorpay Payment/Transaction ID (found in your payment confirmation SMS or email).</li>
        <li>A brief description of the issue.</li>
      </ul>

      <div className="mt-4 duo-card !py-4 text-sm space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-primary font-bold shrink-0">Step 1</span>
          <span>We acknowledge your refund request within <strong>24–48 hours</strong> of receipt.</span>
        </div>
        <div className="w-full h-px bg-border" />
        <div className="flex items-start gap-3">
          <span className="text-primary font-bold shrink-0">Step 2</span>
          <span>We review and validate your transaction details within <strong>2–3 business days</strong>.</span>
        </div>
        <div className="w-full h-px bg-border" />
        <div className="flex items-start gap-3">
          <span className="text-primary font-bold shrink-0">Step 3</span>
          <span>
            If approved, the refund of ₹1 is initiated to your original payment method within
            <strong> 5–7 business days</strong> via Razorpay's refund mechanism. Depending on
            your bank, the credit may take an additional 2–5 business days to reflect.
          </span>
        </div>
      </div>

      <p className="mt-3">
        <strong>Total maximum refund timeline:</strong> Up to <strong>10–12 business days</strong>{" "}
        from the date of refund approval.
      </p>
    </PolicySection>

    <PolicySection number={4} title="Chargebacks &amp; Disputes">
      <p>
        We strongly discourage initiating a chargeback with your bank before contacting us first.
        If you believe a charge is incorrect or unauthorised, email us and we will resolve it
        directly. Unjustified chargebacks may result in account suspension.
      </p>
      <p className="mt-2">
        For legitimate disputes, Razorpay's dispute resolution process governs the outcome in
        accordance with RBI guidelines and applicable Indian payment regulations.
      </p>
    </PolicySection>

    <PolicySection number={5} title="Contact for Refund Queries">
      <p>
        All refund-related communications must be directed to:
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

export default RefundPolicyPage;
