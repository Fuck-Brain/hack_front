// components/ModalPopup.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title?: string;
  placeholder?: string;
  initialText?: string;
}

export default function ModalPopup({
  isOpen,
  onClose,
  onSubmit,
  title = "Редактирование карточки",
  placeholder = "Введите новый текст...",
  initialText = "",
}: ModalPopupProps) {
  const [inputText, setInputText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText("");
      onClose();
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
            className="card-base w-full max-w-lg relative border border-gray-300 bg-[#151515] text-gray-100 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-accent mb-4">
                {title}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={placeholder}
                  className="w-full flex-1 p-3 rounded-md bg-[#1c1c1c] text-gray-100 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                  rows={8}
                  autoFocus
                />

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-5 py-2 bg-accent text-black font-semibold rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    Редактировать
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
