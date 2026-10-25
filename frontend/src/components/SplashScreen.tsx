import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-porcelain">
      <div className="h-56 w-56 md:h-72 md:w-72">
        <DotLottieReact
          src="https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <span className="font-display text-[20px] font-semibold tracking-tight text-ink">Flazly</span>
    </div>
  );
};

export default SplashScreen;
