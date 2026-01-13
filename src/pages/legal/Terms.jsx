import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto prose prose-slate">
        <div className="space-y-6">
          <h1 className="text-4xl font-black">Terms of Service</h1>
          <p className="text-slate-600">
            <strong>Last Updated: December 21, 2024</strong>
          </p>

          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Vauntico ("the Service"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            do not use the Service.
          </p>

          <h2 className="text-2xl font-bold">2. Description of Service</h2>
          <p>
            Vauntico provides an AI-powered platform for creators, offering:
          </p>
          <ul>
            <li>Trust score calculation and analysis</li>
            <li>Creator workflow automation tools</li>
            <li>Payment and monetization infrastructure</li>
            <li>Community features and collaboration tools</li>
          </ul>

          <h2 className="text-2xl font-bold">3. Beta Program</h2>
          <p>
            The Service is currently in private beta. By joining the waitlist or
            beta program:
          </p>
          <ul>
            <li>
              You acknowledge the Service may contain bugs or incomplete
              features
            </li>
            <li>Features may change without notice during the beta period</li>
            <li>Your feedback helps us improve the platform</li>
            <li>Beta access may be revoked at any time</li>
          </ul>

          <h2 className="text-2xl font-bold">4. User Accounts</h2>

          <h3 className="text-xl font-semibold">4.1 Registration</h3>
          <ul>
            <li>
              You must provide accurate, current, and complete information
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account
            </li>
            <li>You must be at least 18 years old to use the Service</li>
            <li>You are responsible for all activities under your account</li>
          </ul>

          <h3 className="text-xl font-semibold">4.2 Account Security</h3>
          <ul>
            <li>You must notify us immediately of any unauthorized use</li>
            <li>
              We are not liable for losses due to stolen or compromised
              credentials
            </li>
            <li>You may not share your account with others</li>
          </ul>

          <h2 className="text-2xl font-bold">5. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Use automated systems to scrape or collect data</li>
            <li>Reverse engineer or decompile the Service</li>
            <li>Resell or redistribute the Service without permission</li>
          </ul>

          <h2 className="text-2xl font-bold">6. Intellectual Property</h2>

          <h3 className="text-xl font-semibold">6.1 Our Rights</h3>
          <ul>
            <li>
              Vauntico and all related trademarks, logos, and content are owned
              by Vauntico
            </li>
            <li>
              The Service's source code, algorithms, and design are protected by
              copyright
            </li>
            <li>
              You may not copy, modify, or create derivative works without
              permission
            </li>
          </ul>

          <h3 className="text-xl font-semibold">6.2 Your Content</h3>
          <ul>
            <li>
              You retain ownership of content you create using the Service
            </li>
            <li>
              You grant us a license to host, store, and display your content
            </li>
            <li>
              You represent that you have rights to all content you upload
            </li>
            <li>We may use anonymized data for analytics and improvements</li>
          </ul>

          <h2 className="text-2xl font-bold">7. Payment Terms</h2>

          <h3 className="text-xl font-semibold">7.1 Pricing</h3>
          <ul>
            <li>
              Pricing is displayed on our website and may change with notice
            </li>
            <li>All prices are in the currency specified at checkout</li>
            <li>Taxes may apply based on your location</li>
          </ul>

          <h3 className="text-xl font-semibold">7.2 Subscriptions</h3>
          <ul>
            <li>Subscriptions renew automatically unless canceled</li>
            <li>
              You may cancel at any time; cancellation takes effect at the end
              of the billing period
            </li>
            <li>No refunds for partial months</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>

          <h3 className="text-xl font-semibold">7.3 Free Tier</h3>
          <ul>
            <li>Free tier features may be modified or removed at any time</li>
            <li>Usage limits apply to free accounts</li>
            <li>We may convert free accounts to paid if limits are exceeded</li>
          </ul>

          <h2 className="text-2xl font-bold">8. Trust Score System</h2>

          <h3 className="text-xl font-semibold">8.1 Calculation</h3>
          <ul>
            <li>Trust scores are calculated using proprietary AI algorithms</li>
            <li>Scores are based on publicly available metrics you provide</li>
            <li>We do not guarantee accuracy of scores</li>
            <li>Scores are for informational purposes only</li>
          </ul>

          <h3 className="text-xl font-semibold">8.2 No Guarantees</h3>
          <ul>
            <li>Trust scores do not guarantee business success</li>
            <li>Scores may change as algorithms improve</li>
            <li>We are not liable for decisions made based on trust scores</li>
          </ul>

          <h2 className="text-2xl font-bold">9. Data and Privacy</h2>
          <ul>
            <li>Your use of the Service is governed by our Privacy Policy</li>
            <li>
              We collect and process data as described in the Privacy Policy
            </li>
            <li>
              You consent to data processing as required to provide the Service
            </li>
            <li>See our Privacy Policy for detailed information</li>
          </ul>

          <h2 className="text-2xl font-bold">10. Third-Party Services</h2>
          <ul>
            <li>
              The Service integrates with third-party platforms (Stripe,
              Paystack, etc.)
            </li>
            <li>Your use of third-party services is subject to their terms</li>
            <li>We are not responsible for third-party service failures</li>
            <li>Third-party terms may change without our control</li>
          </ul>

          <h2 className="text-2xl font-bold">11. Termination</h2>

          <h3 className="text-xl font-semibold">11.1 By You</h3>
          <ul>
            <li>You may terminate your account at any time</li>
            <li>Contact support to request account deletion</li>
            <li>Some data may be retained as required by law</li>
          </ul>

          <h3 className="text-xl font-semibold">11.2 By Us</h3>
          <ul>
            <li>We may suspend or terminate accounts for Terms violations</li>
            <li>We may terminate the Service with 30 days notice</li>
            <li>We may immediately suspend accounts for security reasons</li>
          </ul>

          <h2 className="text-2xl font-bold">12. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE
            DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
          </p>
          <ul>
            <li>Warranties of merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Uninterrupted or error-free service</li>
            <li>Accuracy of results or content</li>
          </ul>

          <h2 className="text-2xl font-bold">13. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
          <ul>
            <li>
              We are not liable for indirect, incidental, or consequential
              damages
            </li>
            <li>
              Our total liability is limited to the amount you paid in the past
              12 months
            </li>
            <li>
              We are not liable for losses due to service interruptions, data
              loss, or security breaches
            </li>
            <li>
              Some jurisdictions do not allow liability limitations; in those
              cases, our liability is limited to the extent permitted by law
            </li>
          </ul>

          <h2 className="text-2xl font-bold">14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Vauntico, its officers,
            directors, and employees from any claims, damages, or expenses
            arising from:
          </p>
          <ul>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your use of the Service</li>
          </ul>

          <h2 className="text-2xl font-bold">15. Dispute Resolution</h2>

          <h3 className="text-xl font-semibold">15.1 Governing Law</h3>
          <p>
            These Terms are governed by the laws of South Africa, without regard
            to conflict of law provisions.
          </p>

          <h3 className="text-xl font-semibold">15.2 Arbitration</h3>
          <p>
            Any disputes will be resolved through binding arbitration in
            Pretoria, South Africa, except for:
          </p>
          <ul>
            <li>Claims for injunctive relief</li>
            <li>Claims related to intellectual property</li>
            <li>Small claims court matters</li>
          </ul>

          <h3 className="text-xl font-semibold">15.3 Class Action Waiver</h3>
          <p>
            You agree to resolve disputes individually, not as part of a class
            action.
          </p>

          <h2 className="text-2xl font-bold">16. Changes to Terms</h2>
          <ul>
            <li>We may update these Terms at any time</li>
            <li>Continued use after changes constitutes acceptance</li>
            <li>
              Material changes will be notified via email or Service
              notification
            </li>
            <li>You should review Terms periodically</li>
          </ul>

          <h2 className="text-2xl font-bold">17. General Provisions</h2>

          <h3 className="text-xl font-semibold">17.1 Entire Agreement</h3>
          <p>
            These Terms constitute the entire agreement between you and
            Vauntico.
          </p>

          <h3 className="text-xl font-semibold">17.2 Severability</h3>
          <p>
            If any provision is unenforceable, the remaining provisions remain
            in effect.
          </p>

          <h3 className="text-xl font-semibold">17.3 No Waiver</h3>
          <p>Failure to enforce any provision does not constitute a waiver.</p>

          <h3 className="text-xl font-semibold">17.4 Assignment</h3>
          <p>
            We may assign these Terms; you may not assign without our consent.
          </p>

          <h3 className="text-xl font-semibold">17.5 Force Majeure</h3>
          <p>
            We are not liable for failures due to circumstances beyond our
            control.
          </p>

          <h2 className="text-2xl font-bold">18. Contact</h2>
          <p>For questions about these Terms:</p>
          <ul>
            <li>Email: legal@vauntico.com</li>
            <li>Address: Pretoria, Gauteng, South Africa</li>
          </ul>

          <hr className="my-8" />

          <p>
            <strong>
              By using Vauntico, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </strong>
          </p>

          <p className="italic">
            <strong>Ubuntu Spirit: "We live by what we give."</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
