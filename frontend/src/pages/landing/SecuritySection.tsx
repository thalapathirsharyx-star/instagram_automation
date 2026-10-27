import React from 'react';
import AnimatedIcon from '../../components/AnimatedIcon';

export const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      title: "Built on Meta Graph API",
      desc: "Connects securely using the Instagram Messaging API. Built to strictly adhere to Meta's developer policies."
    },
    {
      title: "Secure OAuth Authentication",
      desc: "Zero password sharing required. Authorize connections securely through Meta's native Login dialog."
    },
    {
      title: "Data Protection",
      desc: "Lead details and contact logs are fully encrypted. GDPR and CCPA compliant data protection protocols."
    },
    {
      title: "Role-Based Access",
      desc: "Protect sensitive lead data and settings with team access permissions for your support staff."
    },
    {
      title: "Business Account Security",
      desc: "Sandbox environment validation and compliance audits ensure safety for large brand channels."
    },
    {
      title: "Human Oversight Controls",
      desc: "Seamless AI override systems mean your team can step in and take manual control at any instant."
    }
  ];

  return (
    <section id="security" className="py-16 md:py-24 relative px-4 sm:px-6">
      {/* A dark rounded panel, as the reference uses to break up the white page. */}
      <div className="lp-dark-panel mockup-dark max-w-6xl mx-auto px-6 py-16 sm:px-10 md:px-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="mi-tile mb-4 mx-auto flex w-fit">
            <AnimatedIcon name="shield" size={24} />
          </span>
          <span className="lp-eyebrow">Enterprise Security</span>
          <h2 className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4 leading-tight">
            Secure Connections, Complete Control
          </h2>
          <p className="text-base md:text-lg text-[#b9bbd8] leading-relaxed">
            We safeguard your Instagram business account with enterprise-grade data protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 text-left">
          {securityFeatures.map((sec, idx) => (
            <div key={idx} className="lp-dark-card p-7 flex flex-col justify-between">
              <div>
                <h3 className="text-[17px] font-semibold text-white mb-2.5">{sec.title}</h3>
                <p className="text-sm text-[#a9abc9] leading-relaxed">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
