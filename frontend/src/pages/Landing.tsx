import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Modular Landing Sections
import { HeroSection } from './landing/HeroSection';
import { ProductShowcase } from './landing/ProductShowcase';
import { TrustStrip } from './landing/TrustStrip';
import { WorkflowSimulation } from './landing/WorkflowSimulation';
import { ProblemSection } from './landing/ProblemSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { CapabilitiesSection } from './landing/CapabilitiesSection';
import { UseCasesSection } from './landing/UseCasesSection';
import { SocialProofSection } from './landing/SocialProofSection';
import { SecuritySection } from './landing/SecuritySection';
import { ROICalculatorSection } from './landing/ROICalculatorSection';
import { PricingSection } from './landing/PricingSection';
import { FAQSection } from './landing/FAQSection';
import { FinalCTASection } from './landing/FinalCTASection';

const Landing: React.FC = () => {
  return (
    <div className="landing-page font-inter selection:bg-[#1463FF]/15 selection:text-[#0E0B3D] min-h-screen relative overflow-x-hidden">
      {/* The reference's soft, tilted blue slab behind the product preview. */}
      <div className="lp-hero-wash hidden md:block" aria-hidden="true" />

      {/* Main Navbar */}
      <Navbar />

      <main className="relative z-[1] pt-[72px]">
        {/* Phase 2: Streamlined Above-the-Fold Hero */}
        <HeroSection />

        {/* Dedicated Product Showcase Section */}
        <ProductShowcase />

        {/* Trust Badges Strip */}
        <TrustStrip />

        {/* Live DM-to-CRM Pipeline Simulation with off-screen pause */}
        <section className="py-20 max-w-6xl mx-auto px-6 relative z-10">
          <WorkflowSimulation />
        </section>

        {/* Phase 3: Problem / Cost of Manual DM Management */}
        <ProblemSection />

        {/* Phase 4: How It Works & Integrations Flow */}
        <HowItWorksSection />

        {/* Business Outcomes & Central AI Engine Dial */}
        <BenefitsSection />

        {/* Core Platform Capabilities Deep-Dive */}
        <CapabilitiesSection />

        {/* Tailored Solutions / Target Personas */}
        <UseCasesSection />

        {/* Social Proof & Customer Reviews */}
        <SocialProofSection />

        {/* Enterprise Security & Meta Compliance */}
        <SecuritySection />

        {/* Interactive ROI Calculator */}
        <ROICalculatorSection />

        {/* Pricing Plans */}
        <PricingSection />

        {/* Frequently Asked Questions Accordion */}
        <FAQSection />

        {/* High-Converting Final Call to Action */}
        <FinalCTASection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
