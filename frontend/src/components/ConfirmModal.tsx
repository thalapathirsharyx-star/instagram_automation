import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

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

/**
 * A dialog states what will happen and names the action in the button, so the
 * confirm label matches the verb the person just chose. Motion answers the
 * person opening it and nothing else.
 */
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
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes. Focus lands on the action, except for a destructive one,
  // where a reflexive Enter must not delete anything; it lands on Cancel.
  // Closing hands focus back to whatever opened the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    (type === 'danger' ? cancelRef : confirmRef).current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [isOpen, isLoading, onCancel, type]);

  const confirmClass =
    type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-ink/45"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="modal relative max-w-md"
          >
            <div className="modal-head border-b-0 pb-2">
              <div>
                <h3 id="confirm-title">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{message}</p>
              </div>
              {!isLoading && (
                <button onClick={onCancel} className="btn btn-ghost btn-icon btn-sm -mr-2 -mt-1" aria-label="Close">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="modal-foot mt-3">
              <button ref={cancelRef} type="button" onClick={onCancel} disabled={isLoading} className="btn">
                {cancelText}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                aria-busy={isLoading || undefined}
                className={confirmClass}
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
