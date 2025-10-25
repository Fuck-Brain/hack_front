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
    if (!isSubmitDisabled) {
      onSubmit();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="card-base w-full max-w-2xl relative border border-gray-300 bg-[#151515] text-gray-100 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-semibold text-accent mb-4">
                {title}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto pr-1">
                  {children}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-gray-600 text-gray-200 transition-colors hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(isSubmitDisabled)}
                    className="px-5 py-2 bg-accent text-black font-semibold rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {submitLabel}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
