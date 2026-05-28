import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

interface Props {
  feature: string;
}

const UpgradeOverlay: React.FC<Props> = ({ feature }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 rounded-2xl">
      <div className="text-center p-8 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
          <Lock size={28} className="text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Upgrade to Unlock {feature}
        </h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          This feature requires a Pro plan or higher. Upgrade now to access {feature.toLowerCase()} and supercharge your Instagram automation.
        </p>
        <button
          onClick={() => navigate('/billing')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 mx-auto"
        >
          <Sparkles size={16} />
          View Plans & Upgrade
        </button>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
