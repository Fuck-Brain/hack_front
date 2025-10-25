// components/ModalPopup.tsx
"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  submitLabel?: string;
  isSubmitDisabled?: boolean;
  children: ReactNode;
}

export default function ModalPopup({
  isOpen,
  onClose,
  onSubmit,
  title = "Редактирование",
  submitLabel = "Сохранить",
  isSubmitDisabled,
  children,
}: ModalPopupProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitDisabled) onSubmit();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl border border-gray-700 bg-[#151515] text-gray-100 rounded-2xl shadow-2xl flex flex-col"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Заголовок */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-semibold text-accent">{title}</h2>
            </div>

            {/* Контент */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col max-h-[85vh]"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {children}
              </div>

              {/* Футер */}
              <div className="p-6 border-t border-gray-700 bg-[#1a1a1a] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={Boolean(isSubmitDisabled)}
                  className="px-5 py-2 bg-accent text-black font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
