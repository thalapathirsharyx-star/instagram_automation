import React from 'react';

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
    <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b] border-t border-zinc-200/80 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F39F6] dark:text-[#818CF8]">Enterprise Security</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4 leading-tight">
            Secure Connections, Complete Control
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            We safeguard your Instagram business account with enterprise-grade data protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {securityFeatures.map((sec, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 rounded-3xl p-8 hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-md">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 font-inter">{sec.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
