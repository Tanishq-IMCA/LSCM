"use client";

import { motion } from "framer-motion";

export function AnimatedExclamationIcon() {
  return (
    <motion.div
      className="w-4 h-4 flex items-center justify-center"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path 
          d="M12 9v4"
          animate={{ scaleY: [1, 0.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.path 
          d="M12 17h.01" 
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
    </motion.div>
  );
}