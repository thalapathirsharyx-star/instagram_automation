import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, X } from 'lucide-react';

interface Props {
  feature: string;
  onClose?: () => void;
}

const UpgradeOverlay: React.FC<Props> = ({ feature, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 rounded-2xl">
      <div className="text-center p-8 max-w-md relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center mb-6">
          <Lock size={28} className="text-brand" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">
          Upgrade to Unlock {feature}
        </h3>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          This feature requires a Pro plan or higher. Upgrade now to access {feature.toLowerCase()} and supercharge your Instagram automation.
        </p>
        <button
          onClick={() => navigate('/billing')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-zinc-900 font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 mx-auto"
        >
          <Sparkles size={16} />
          View Plans & Upgrade
        </button>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
