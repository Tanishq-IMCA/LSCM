"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmButtonProps = {
  onConfirm: () => void;
  className?: string;
  children: React.ReactNode;
  confirmText?: string;
  timeout?: number;
};

export function ConfirmButton({
  onConfirm,
  className,
  children,
  confirmText = "Are you sure?",
  timeout = 3000,
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleInitialClick = () => {
    if (isConfirming) {
      onConfirm();
      setIsConfirming(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      setIsConfirming(true);
      timerRef.current = setTimeout(() => {
        setIsConfirming(false);
      }, timeout);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleInitialClick}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {isConfirming ? (
          <motion.span
            key="confirm"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {confirmText}
          </motion.span>
        ) : (
          <motion.span
            key="initial"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
      {isConfirming && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-rose-500"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: timeout / 1000, ease: "linear" }}
        />
      )}
    </motion.button>
  );
}