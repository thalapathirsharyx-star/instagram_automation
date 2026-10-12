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
    <div className="landing-page bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter selection:bg-[#38BDF8]/10 selection:text-[#38BDF8] min-h-screen relative overflow-x-hidden">
      {/* Animated Grid Background for Hero Section */}
      <div className="absolute top-0 inset-x-0 h-[1000px] hero-line-grid pointer-events-none select-none z-0" />

      {/* Premium Shifting Mesh Gradient Backdrop */}
      <div className="absolute top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute -top-[20%] left-[10%] w-[60%] h-[70%] rounded-full bg-[#818CF8]/5 dark:bg-[#818CF8]/10 blur-[120px] animate-mesh-glow-1" />
        <div className="absolute -top-[30%] right-[10%] w-[50%] h-[60%] rounded-full bg-[#3B82F6]/6 dark:bg-[#3B82F6]/12 blur-[140px] animate-mesh-glow-2" />
        <div className="absolute top-[10%] left-[30%] w-[40%] h-[50%] rounded-full bg-[#06B6D4]/4 dark:bg-[#06B6D4]/8 blur-[100px] animate-mesh-glow-3" />
      </div>

      {/* Left side automation connection lines */}
      <div className="absolute top-[120px] left-0 w-[20%] max-w-[300px] h-[600px] pointer-events-none select-none z-0 hidden lg:block opacity-[0.6] dark:opacity-[0.7]">
        <svg className="w-full h-full" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" stroke="url(#leftLineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" stroke="url(#leftLineGrad)" strokeWidth="1.5" className="animate-flow-dash" />
          <circle r="3" fill="#3B82F6">
            <animateMotion dur="10s" repeatCount="indefinite" path="M-50 50 C 150 150, 100 300, 50 450 C 0 550, 100 600, -50 650" />
          </circle>
          <defs>
            <linearGradient id="leftLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Right side automation connection lines */}
      <div className="absolute top-[160px] right-0 w-[20%] max-w-[300px] h-[600px] pointer-events-none select-none z-0 hidden lg:block opacity-[0.6] dark:opacity-[0.7]">
        <svg className="w-full h-full" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" stroke="url(#rightLineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" stroke="url(#rightLineGrad)" strokeWidth="1.5" className="animate-flow-dash" />
          <circle r="3" fill="#06B6D4">
            <animateMotion dur="12s" repeatCount="indefinite" path="M250 80 C 50 180, 100 320, 150 420 C 200 520, 80 580, 250 630" />
          </circle>
          <defs>
            <linearGradient id="rightLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Radial glows for scroll depth */}
      <div className="absolute top-[1500px] left-0 w-[500px] h-[500px] bg-[#3B82F6]/3 blur-[120px] pointer-events-none" />
      <div className="absolute top-[2500px] right-0 w-[500px] h-[500px] bg-[#06B6D4]/3 blur-[120px] pointer-events-none" />

      {/* Main Navbar */}
      <Navbar />

      <main className="pt-[72px]">
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
