import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[30%] w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-72 h-72 md:w-96 md:h-96 flex flex-col items-center">
        <DotLottieReact
          src="https://lottie.host/8166af2b-fc65-4b1d-91e7-d54e88e04a97/TIUNin8LAv.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Loading Text */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <span className="text-xl font-black tracking-widest text-foreground uppercase">
            Reply<span className="gradient-text-premium">Zens</span>
          </span>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
