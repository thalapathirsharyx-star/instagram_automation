import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-md bg-white dark:bg-[#09090B] border border-slate-200 dark:border-zinc-200 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Ambient accent top glow */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${
              type === 'danger' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
              type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              'bg-gradient-to-r from-purple-500 to-indigo-650'
            }`} />

            {/* Close Button */}
            {!isLoading && (
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-zinc-500 hover:text-slate-650 dark:text-zinc-500 dark:hover:text-zinc-350 transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary"
              >
                <X size={16} />
              </button>
            )}

            {/* Content */}
            <div className="flex items-start gap-4 mb-6 mt-2">
              <div className={`p-3 rounded-2xl shrink-0 border ${
                type === 'danger' ? 'bg-rose-500/10 text-destructive border-rose-500/20' :
                type === 'warning' ? 'bg-warning/10 text-warning border-amber-500/20' :
                'bg-brand/10 text-brand border-brand/20'
              }`}>
                {type === 'danger' && <AlertCircle size={24} />}
                {type === 'warning' && <AlertTriangle size={24} />}
                {type === 'primary' && <Info size={24} />}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-primary dark:hover:bg-primary/90 border border-slate-200/60 dark:border-zinc-200 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-350 transition-all disabled:opacity-50 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-6 py-2.5 text-zinc-900 font-bold text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
                  type === 'danger' ? 'bg-rose-600 hover:bg-destructive/90 shadow-lg shadow-rose-600/10 dark:shadow-rose-600/5' :
                  type === 'warning' ? 'bg-warning hover:bg-warning shadow-lg shadow-amber-600/10 dark:shadow-amber-600/5' :
                  'bg-brand hover:bg-brand shadow-lg shadow-purple-650/10 dark:shadow-purple-650/5'
                }`}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
