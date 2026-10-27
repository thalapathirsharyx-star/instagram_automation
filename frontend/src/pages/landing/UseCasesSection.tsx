import React from 'react';

export const UseCasesSection: React.FC = () => {
  const useCases = [
    {
      title: "E-commerce Brands",
      desc: "Generate more qualified leads and sales from product availability or shipping inquiries in the inbox."
    },
    {
      title: "Coaches & Consultants",
      desc: "Qualify inbound prospects and capture email/phone details before directing them to consultation links."
    },
    {
      title: "Agencies",
      desc: "Manage and run high-performing Instagram lead generation campaigns for multiple client accounts seamlessly."
    },
    {
      title: "Creators",
      desc: "Automatically DM commenters and story replies, converting views and followers into qualified leads."
    },
    {
      title: "Local Businesses",
      desc: "Capture store inquiries, location requests, and customer contact information 24/7."
    }
  ];

  return (
    <section className="py-28 relative bg-[#fafafa] dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="lp-eyebrow is-violet">Tailored Solutions</span>
          <h2 className="lp-title text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3 mb-4">
            Who Uses Flazly?
          </h2>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Maximize the ROI of your social audience and convert inbound intent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          {useCases.map((uc, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#121826]/40 border border-zinc-200/80 dark:border-white/5 flex flex-col justify-between hover:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 transition-all shadow-sm hover:shadow-md">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2 font-inter">{uc.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
