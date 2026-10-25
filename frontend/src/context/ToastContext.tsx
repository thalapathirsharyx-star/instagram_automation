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
      <Toaster ContainerPosition="bottom-right" />
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

  // The rail carries the outcome, so the toast needs no coloured fill behind
  // the text it is there to let you read.
  const railClass: Record<Toast['type'], string> = {
    success: 'bg-signal-go',
    error: 'bg-signal-stop',
    warning: 'bg-signal-warn',
    info: 'bg-viridian',
  };

  return (
    <div
      className={`fixed z-[99999] flex gap-2.5 max-w-sm w-full pointer-events-none ${positionClasses}`}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="surface-lifted pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden p-3.5 pl-4"
          >
            <div className={`absolute left-0 top-0 h-full w-[3px] ${railClass[t.type]}`} />

            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'success' && <CheckCircle2 className="h-[18px] w-[18px] text-signal-go" />}
              {t.type === 'error' && <AlertCircle className="h-[18px] w-[18px] text-signal-stop" />}
              {t.type === 'warning' && <AlertTriangle className="h-[18px] w-[18px] text-signal-warn" />}
              {t.type === 'info' && <Info className="h-[18px] w-[18px] text-viridian" />}
            </div>

            <div className="flex-grow pr-5">
              <h4 className="text-[15px] font-medium leading-snug text-ink">{t.message}</h4>
              {t.description && (
                <p className="mt-1 text-[13px] leading-normal text-ink-soft">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="absolute right-2 top-2 rounded-[6px] p-1 text-ink-faint transition-colors hover:bg-porcelain-deep hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
