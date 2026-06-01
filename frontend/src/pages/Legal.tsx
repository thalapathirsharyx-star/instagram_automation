import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LegalPageProps {
  activeTab: 'privacy' | 'terms' | 'deletion';
}

const PrivacyContent: React.FC = () => (
  <>
    <h1>Privacy Policy</h1>
    <p className="text-xs text-zinc-500 mb-6">Last Updated: June 1, 2026</p>
    
    <section>
      <h2>1. Overview & Commitment to Privacy</h2>
      <p>
        At ReplyZens, we build enterprise-grade automation and customer relationship management (CRM) solutions for professional Instagram creators, agencies, and businesses. We value your trust and are fully committed to protecting the privacy, security, and integrity of your personal information, as well as the data processed through our application.
      </p>
      <p>
        This Privacy Policy explains how ReplyZens ("we", "us", "our") collects, stores, processes, shares, and protects your information, and how we handle data from Meta (Facebook and Instagram) APIs. By using our platform, you consent to the data practices described in this policy.
      </p>
    </section>

    <section>
      <h2>2. Meta API Integration & Data Authority</h2>
      <p>
        ReplyZens integrates with the official Meta Graph API (Instagram Messaging API) to provide unified CRM inboxes, lead routing, and automated reply flows. In compliance with the Meta Platform Terms and Developer Policies:
      </p>
      <ul>
        <li><strong>Authorized Access Only:</strong> We access your Instagram messaging data solely after you explicitly authorize access using Meta OAuth.</li>
        <li><strong>No Unauthorized Storage:</strong> We do not store the full content of your Instagram message history permanently. Message payloads are parsed in real-time, categorized, and metadata is stored for CRM lead tracking.</li>
        <li><strong>Strict Purpose Limitation:</strong> We only request permissions necessary to deliver our CRM and automation features. We do not sell, rent, or trade any customer data accessed via Meta APIs to third parties.</li>
      </ul>
    </section>

    <section>
      <h2>3. The Information We Collect</h2>
      <p>
        We collect data to provide, improve, and optimize our services. This collection falls into the following categories:
      </p>
      <h3>A. Account Registration Information</h3>
      <p>
        When you register for an account, we collect your name, email address, password hash, role within your organization, billing address, and subscription choices.
      </p>
      <h3>B. Connected Platform Metadata</h3>
      <p>
        To authorize message flow, we collect access tokens, page IDs, and connected Instagram account handles. These tokens are encrypted at rest.
      </p>
      <h3>C. Incoming Messaging Metadata</h3>
      <p>
        Through Meta Webhooks, we receive information about messages sent to your Instagram account, including: sender username/handle, timestamp, message text, and attachments (such as images or files). This text is processed by our AI core to execute automated response workflows.
      </p>
      <h3>D. Operational Logs</h3>
      <p>
        We capture analytics logs including interaction counts, automation trigger success rates, and sync status with connected destinations (e.g., Google Sheets).
      </p>
    </section>

    <section>
      <h2>4. How We Use Collected Information</h2>
      <p>
        We use the collected data for specific, limited business purposes:
      </p>
      <ul>
        <li><strong>SaaS Delivery:</strong> To operate your account, synchronize your DMs with the web inbox, and route messages to team members.</li>
        <li><strong>Workflow Automation:</strong> To trigger automated replies based on user-defined keywords, FAQ databases, and our custom AI assistant (Maya).</li>
        <li><strong>External Integrations:</strong> To sync qualified lead information (handles, emails, interest levels) directly to your external databases, like Google Sheets, as configured in your dashboard.</li>
        <li><strong>Spam & Noise Filtering:</strong> To run incoming messages through NLP filters to block spam, emojis, and low-intent message flows.</li>
      </ul>
    </section>

    <section>
      <h2>5. Data Security & Storage</h2>
      <p>
        We employ robust technical and administrative security measures:
      </p>
      <ul>
        <li><strong>Encryption:</strong> All data is encrypted in transit using Transport Layer Security (TLS 1.3) and at rest using AES-256 encryption.</li>
        <li><strong>Token Protection:</strong> OAuth user tokens and LLM API keys are encrypted at rest using a dedicated secure key management service.</li>
        <li><strong>System Auditing:</strong> Regular automated security scanning, container auditing, and database vulnerability checks.</li>
      </ul>
    </section>

    <section>
      <h2>6. Data Sharing, Disclosures, & Subprocessors</h2>
      <p>
        We do not sell your personal data. We share information only with trusted subprocessors necessary to deliver the SaaS service, under strict data protection agreements:
      </p>
      <ul>
        <li><strong>Hosting Services:</strong> Core backend infrastructure and databases are hosted on secure cloud providers.</li>
        <li><strong>AI Providers:</strong> Message content is sent to secure Large Language Model APIs (such as OpenAI or Anthropic) for response generation. These providers do not use our customers' data to train their public models.</li>
        <li><strong>Payment Processors:</strong> Billing is processed through secure, PCI-compliant payment gateways.</li>
      </ul>
    </section>

    <section>
      <h2>7. Data Retention & Deletion</h2>
      <p>
        We retain your information only as long as your account remains active or as needed to provide our services. You have the right to request deletion of all associated data at any time. When you disconnect an Instagram page, all access tokens and temporary messaging logs associated with that page are immediately and permanently purged from our servers within 24 hours.
      </p>
    </section>

    <section>
      <h2>8. Your Legal Rights (GDPR / CCPA Compliance)</h2>
      <p>
        Depending on your location, you may have rights under the General Data Protection Regulation (GDPR) or the California Consumer Privacy Act (CCPA), including:
      </p>
      <ul>
        <li>The right to access and receive a copy of your personal data.</li>
        <li>The right to rectify inaccurate data or complete incomplete data.</li>
        <li>The right to request erasure ("right to be forgotten") of your data.</li>
        <li>The right to withdraw your API consent at any time.</li>
      </ul>
    </section>

    <section>
      <h2>9. Contact Us</h2>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our Data Protection Officer at:
      </p>
      <p className="font-bold">
        Email: support@replyzens.in
      </p>
    </section>
  </>
);

const TermsContent: React.FC = () => (
  <>
    <h1>Terms of Service</h1>
    <p className="text-xs text-zinc-500 mb-6">Last Updated: June 1, 2026</p>

    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account, accessing, or using ReplyZens ("Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, you are prohibited from using the Service.
      </p>
    </section>

    <section>
      <h2>2. Description of Service</h2>
      <p>
        ReplyZens is a SaaS platform providing Instagram messaging automation, AI assistant routing, and customer relationship management (CRM) tools. The Service is provided "as is" and "as available". We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice.
      </p>
    </section>

    <section>
      <h2>3. Meta Platform & Policy Compliance</h2>
      <p>
        Our Service relies on integration with Meta (Facebook/Instagram) APIs.
      </p>
      <ul>
        <li><strong>Compliance:</strong> You must comply with all Meta Platform Terms, Instagram Community Guidelines, and Meta Developer Policies while using ReplyZens.</li>
        <li><strong>Account Integrity:</strong> You are responsible for ensuring your Instagram account configuration allows official API access. We are not liable for any restriction, suspension, or termination of your Meta account by Meta.</li>
        <li><strong>Rate Limits:</strong> You agree not to exceed or attempt to bypass Meta API rate limit controls.</li>
      </ul>
    </section>

    <section>
      <h2>4. User Accounts & Security</h2>
      <p>
        To access the Service, you must create a user account. You agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information during registration.</li>
        <li>Keep your account credentials, API tokens, and passwords highly secure.</li>
        <li>Notify us immediately of any unauthorized use or security breach of your account.</li>
      </ul>
    </section>

    <section>
      <h2>5. Subscription Billing, Fees, & Cancellations</h2>
      <p>
        Certain features are subject to monthly or annual subscription fees.
      </p>
      <ul>
        <li><strong>Payment:</strong> You agree to provide a valid payment method. Fees are billed in advance on a recurring basis.</li>
        <li><strong>Refunds:</strong> All payments are non-refundable unless specified otherwise. We offer a 14-day free trial on Pro plans.</li>
        <li><strong>Cancellation:</strong> You may cancel your subscription at any time via the Billing dashboard. Cancellation will stop future recurring charges, and your plan will remain active until the end of the current billing cycle.</li>
      </ul>
    </section>

    <section>
      <h2>6. Intellectual Property Rights</h2>
      <p>
        ReplyZens and its original logo, graphics, user interface design, and codebase are the exclusive property of ReplyZens Inc. and are protected by international copyright and trademark laws. You receive a limited, revocable, non-transferable license to use the Service for your business operations.
      </p>
    </section>

    <section>
      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, ReplyZens Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or Meta account status, resulting from your use of or inability to use the Service.
      </p>
    </section>

    <section>
      <h2>8. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising out of these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.
      </p>
    </section>
  </>
);

const DeletionContent: React.FC = () => (
  <>
    <h1>Data Deletion Instructions</h1>
    <p className="text-xs text-zinc-500 mb-6">Last Updated: June 1, 2026</p>

    <section>
      <h2>How to Manage and Delete Your Data</h2>
      <p>
        At ReplyZens, we respect your privacy and provide a fully compliant, self-serve way to revoke platform access and permanently delete all your data from our systems.
      </p>
    </section>

    <section>
      <h2>Option 1: Complete Account & Data Purge (In-App)</h2>
      <p>
        If you want to permanently delete your ReplyZens account and purge all databases containing your profile information, connected channels, and CRM logs:
      </p>
      <p>1. Log in to your <strong>ReplyZens Dashboard</strong>.</p>
      <p>2. Navigate to <strong>Settings</strong> &gt; <strong>Account Management</strong>.</p>
      <p>3. Under the "Danger Zone" section, click <strong>Delete Account & Purge Data</strong>.</p>
      <p>4. Confirm your password. All access tokens, CRM logs, message metadata, and settings will be permanently and irreversibly deleted from our servers within 10 minutes.</p>
    </section>

    <section>
      <h2>Option 2: Disconnect via Meta (Facebook / Instagram)</h2>
      <p>
        You can revoke ReplyZens' permissions to your Facebook and Instagram accounts directly through Meta's platform settings:
      </p>
      <p>1. Go to your Facebook profile's <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</p>
      <p>2. In the left-hand menu, click on <strong>Apps and Websites</strong>.</p>
      <p>3. Locate <strong>ReplyZens</strong> in the active list and click <strong>Remove</strong>.</p>
      <p>4. Check the box to confirm removal. This invalidates all API OAuth tokens instantly on Meta's side, preventing any future data access by ReplyZens.</p>
    </section>

    <section>
      <h2>Option 3: Direct Email Request (Manual Purge)</h2>
      <p>
        If you are unable to access your dashboard or want to request a manual deletion of all personal data held by us, please submit a request to our data engineering team:
      </p>
      <ul>
        <li><strong>Email:</strong> support@replyzens.in</li>
        <li><strong>Subject Line:</strong> Data Deletion Request (Meta API)</li>
        <li><strong>Required Info:</strong> Please include your registered account email and your connected Instagram business handle.</li>
      </ul>
      <p>
        Upon receiving your email, we will verify ownership of the account and process the full database deletion within 48 hours. A formal confirmation email will be sent once the process is complete.
      </p>
    </section>
  </>
);

const LegalPage: React.FC<LegalPageProps> = ({ activeTab }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="legal-page flex-grow">
        <div className="background-decor">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div className="legal-container">
          <article className="legal-content">
            {activeTab === 'privacy' && <PrivacyContent />}
            {activeTab === 'terms' && <TermsContent />}
            {activeTab === 'deletion' && <DeletionContent />}
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => <LegalPage activeTab="privacy" />;
export const TermsOfService: React.FC = () => <LegalPage activeTab="terms" />;
export const DataDeletion: React.FC = () => <LegalPage activeTab="deletion" />;
