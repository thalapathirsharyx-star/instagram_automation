import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
  };
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    message: string,
    type: Toast['type'],
    description?: string,
    duration = 4000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, description, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  const toast = {
    success: (msg: string, desc?: string, dur?: number) => addToast(msg, 'success', desc, dur),
    error: (msg: string, desc?: string, dur?: number) => addToast(msg, 'error', desc, dur),
    info: (msg: string, desc?: string, dur?: number) => addToast(msg, 'info', desc, dur),
    warning: (msg: string, desc?: string, dur?: number) => addToast(msg, 'warning', desc, dur),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <Toaster ContainerPosition="top-right" />
    </ToastContext.Provider>
  );
};

const Toaster: React.FC<{ ContainerPosition?: 'top-right' | 'bottom-right' }> = ({
  ContainerPosition = 'bottom-right',
}) => {
  const { toasts, dismiss } = useToast();

  const positionClasses =
    ContainerPosition === 'top-right'
      ? 'top-6 right-6 flex-col-reverse'
      : 'bottom-6 right-6 flex-col';

  return (
    <div className={`fixed z-[99999] flex gap-3 max-w-sm w-full pointer-events-none ${positionClasses}`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full pointer-events-auto bg-white/90 dark:bg-zinc-950/90 border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-start gap-3 relative overflow-hidden"
          >
            {/* Ambient accent background glow */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              t.type === 'success' ? 'bg-emerald-500' :
              t.type === 'error' ? 'bg-rose-500' :
              t.type === 'warning' ? 'bg-amber-500' :
              'bg-sky-500'
            }`} />

            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {t.type === 'info' && <Info className="h-5 w-5 text-sky-500" />}
            </div>

            <div className="flex-grow pr-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 leading-tight">
                {t.message}
              </h4>
              {t.description && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium leading-normal">
                  {t.description}
                </p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
