import PolicyShell, { PolicySection, PolicyHighlight } from "@/components/PolicyShell";

const TermsAndConditionsPage = () => (
  <PolicyShell
    icon="📜"
    title="Terms & Conditions"
    subtitle="The rules governing your use of the ₹1 Quest platform."
    lastUpdated="23 May 2025"
  >
    <PolicyHighlight variant="default">
      These Terms &amp; Conditions ("Terms") constitute a legally binding agreement between you
      ("User") and <strong>BHUPATI DARMARAO</strong> ("Operator"), the owner and operator of the
      ₹1 Quest platform accessible at this domain. By accessing or using the platform, you
      confirm that you have read, understood, and agree to be bound by these Terms.
    </PolicyHighlight>

    <PolicySection number={1} title="Eligibility">
      <p>To use this platform, you must:</p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>Be at least 18 years of age or have parental/guardian consent.</li>
        <li>Be a resident of India or be able to make INR-denominated payments via Razorpay.</li>
        <li>Provide accurate, current, and complete registration information.</li>
        <li>Not be previously banned or suspended from this platform.</li>
      </ul>
    </PolicySection>

    <PolicySection number={2} title="Platform Description">
      <p>
        The ₹1 Quest is a social experiment and gamified community platform. Users pay a
        one-time entry fee of ₹1 (one Indian Rupee) via Razorpay to gain access to the Wall of
        Legends — a public leaderboard displaying verified paying participants. Upon successful
        payment, users receive:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>Immediate access to the Wall of Legends and Leaderboard.</li>
        <li>100 XP credited to their account.</li>
        <li>A unique referral code to invite others.</li>
        <li>Eligibility to earn additional XP, badges, and rank upgrades.</li>
      </ul>
    </PolicySection>

    <PolicySection number={3} title="Payment Terms">
      <p>
        All payments are processed securely through <strong>Razorpay Payment Solutions Pvt. Ltd.</strong>
        The applicable fee at the time of writing is <strong>₹1 (one Indian Rupee)</strong> per
        account, non-recurring. By initiating payment:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>You authorise the deduction of ₹1 from your chosen payment method.</li>
        <li>You acknowledge that all payment instrument data is processed by Razorpay and not stored by us.</li>
        <li>You confirm the payment is made voluntarily for the digital access described herein.</li>
      </ul>
      <PolicyHighlight variant="warning">
        <strong>Important:</strong> The ₹1 entry fee is a token payment that provides access to digital
        content. It is not a donation, charity, or financial contribution to any fund. The platform
        does not guarantee any monetary return or prize.
      </PolicyHighlight>
    </PolicySection>

    <PolicySection number={4} title="User Conduct">
      <p>By using this platform, you agree not to:</p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>Use false identity information or impersonate another person.</li>
        <li>Attempt to manipulate the leaderboard, XP system, or referral codes through fraudulent means.</li>
        <li>Initiate chargebacks or payment disputes in bad faith.</li>
        <li>Reverse-engineer, scrape, or attempt to access backend systems without authorisation.</li>
        <li>Post, upload, or transmit any abusive, illegal, or defamatory content.</li>
        <li>Use the platform in any manner that violates applicable Indian law.</li>
      </ul>
      <p className="mt-2">
        Violation of these conduct rules may result in immediate account suspension or termination
        without refund.
      </p>
    </PolicySection>

    <PolicySection number={5} title="Intellectual Property">
      <p>
        All platform content — including but not limited to the name "The ₹1 Quest", design
        elements, gamification logic, written copy, and branding — is the exclusive intellectual
        property of BHUPATI DARMARAO. You may not reproduce, distribute, or create derivative
        works from any platform content without prior written permission.
      </p>
      <p className="mt-2">
        User-generated content (e.g., display names on the leaderboard) remains the property of
        the respective users, but you grant us a non-exclusive, royalty-free licence to display
        this content on the platform.
      </p>
    </PolicySection>

    <PolicySection number={6} title="Disclaimers &amp; Limitation of Liability">
      <p>
        The platform is provided on an <strong>"as is"</strong> and <strong>"as available"</strong>{" "}
        basis. We make no warranties, express or implied, regarding uninterrupted service,
        error-free operation, or fitness for a particular purpose.
      </p>
      <p className="mt-2">
        To the maximum extent permitted under applicable Indian law, BHUPATI DARMARAO shall not
        be liable for any indirect, incidental, special, or consequential damages arising out of
        your use of or inability to use the platform, including loss of data, loss of revenue, or
        personal injury.
      </p>
      <p className="mt-2">
        Our total aggregate liability for any claim arising from these Terms shall not exceed the
        amount you paid to access the platform (i.e., ₹1).
      </p>
    </PolicySection>

    <PolicySection number={7} title="Modifications to Terms">
      <p>
        We reserve the right to update these Terms at any time. Changes will be posted on this
        page with an updated "Last Updated" date. Continued use of the platform after changes
        are posted constitutes acceptance of the revised Terms.
      </p>
    </PolicySection>

    <PolicySection number={8} title="Governing Law &amp; Jurisdiction">
      <p>
        These Terms shall be governed by and construed in accordance with the laws of India.
        Any disputes arising out of or in connection with these Terms shall be subject to the
        exclusive jurisdiction of the courts located in <strong>Hyderabad, Telangana</strong>.
      </p>
    </PolicySection>

    <PolicySection number={9} title="Contact">
      <p>For any queries related to these Terms, contact us at:</p>
      <div className="mt-2 duo-card text-sm space-y-1 !py-4">
        <p><strong className="text-foreground">Name:</strong> BHUPATI DARMARAO</p>
        <p>
          <strong className="text-foreground">Email:</strong>{" "}
          <a href="mailto:bhupathi.dharmarao@outlook.com" className="text-accent hover:underline">
            bhupathi.dharmarao@outlook.com
          </a>
        </p>
        <p><strong className="text-foreground">Address:</strong> Shanti Nagar, Ramanthapur, Hyderabad, Telangana — 500013</p>
        <p><strong className="text-foreground">Response Time:</strong> Within 24–48 hours for all queries</p>
      </div>
    </PolicySection>
  </PolicyShell>
);

export default TermsAndConditionsPage;
