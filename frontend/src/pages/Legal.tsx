import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="background-decor">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="legal-container glass-card">
        <button
          onClick={() => navigate('/')}
          className="back-link"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
        >
          <ChevronLeft size={18} /> Back to Home
        </button>
        <h1>{title}</h1>
        <div className="legal-content premium-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy">
    <p>Last Updated: April 16, 2026</p>
    <section>
      <h2>1. Introduction</h2>
      <p>Welcome to ReplyZens. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our Instagram CRM services.</p>
    </section>
    <section>
      <h2>2. Information We Collect</h2>
      <p>We collect information that you provide directly to us, such as when you create an account, as well as information from your Instagram account when you connect it to our service via the Meta API, including messages, profile information, and contact details for the purpose of CRM management.</p>
    </section>
    <section>
      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, including automating responses, tracking leads, and providing analytics for your Instagram engagement.</p>
    </section>
    <section>
      <h2>4. Data Security</h2>
      <p>We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
    </section>
    <section>
      <h2>5. Contact Us</h2>
      <p>If you have questions or comments about this policy, you may email us at support@replyzens.com.</p>
    </section>
  </LegalLayout>
);

export const TermsOfService: React.FC = () => (
  <LegalLayout title="Terms of Service">
    <p>Last Updated: April 16, 2026</p>
    <section>
      <h2>1. Agreement to Terms</h2>
      <p>By accessing or using ReplyZens, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>
    </section>
    <section>
      <h2>2. Use of Meta APIs</h2>
      <p>Our service integrates with Meta (Facebook/Instagram) APIs. You must comply with all Meta platform policies when using our service. We are not responsible for any actions taken by Meta regarding your account.</p>
    </section>
    <section>
      <h2>3. User Responsibilities</h2>
      <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
    </section>
  </LegalLayout>
);

export const DataDeletion: React.FC = () => (
  <LegalLayout title="Data Deletion Instructions">
    <section>
      <h2>How to Delete Your Data</h2>
      <p>At ReplyZens, we respect your privacy and provide a simple way to delete your data from our systems.</p>
      <h3>Option 1: Disconnect via Facebook</h3>
      <p>1. Go to your Facebook Profile's "Settings & Privacy" {' > '} "Settings".</p>
      <p>2. Look for "Apps and Websites" and search for "ReplyZens".</p>
      <p>3. Click "Remove".</p>

      <h3>Option 2: Direct Request</h3>
      <p>You can request your data to be deleted from our database by sending an email to <strong>support@replyzens.com</strong> with the subject "Data Deletion Request". Please include your Instagram handle and the email associated with your account. We will process your request within 48 hours.</p>
    </section>
  </LegalLayout>
);
