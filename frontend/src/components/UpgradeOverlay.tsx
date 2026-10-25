import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';

interface Props {
  feature: string;
  onClose?: () => void;
}

/**
 * Shown over a feature the current plan does not include. It says which plan
 * opens it and goes straight there, rather than selling the feature back to
 * someone who already tried to use it.
 */
const UpgradeOverlay: React.FC<Props> = ({ feature, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[10px] bg-porcelain/80 backdrop-blur-[2px]">
      <div className="surface-lifted relative max-w-sm p-6 text-center">
        {onClose && (
          <button onClick={onClose} className="btn btn-quiet btn-icon absolute right-2 top-2" aria-label="Close">
            <X size={16} />
          </button>
        )}

        <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-porcelain-deep text-ink-soft">
          <Lock size={16} />
        </div>

        <h3 className="font-display text-[17px] font-semibold text-ink">{feature} is on the Pro plan</h3>
        <p className="mx-auto mt-1.5 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
          Your current plan does not include it. Compare the plans to see what changes.
        </p>

        <button onClick={() => navigate('/billing')} className="btn btn-primary mx-auto mt-5">
          See plans
        </button>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
