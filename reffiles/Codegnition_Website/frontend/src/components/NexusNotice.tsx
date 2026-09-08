"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

export type NoticeType = "success" | "error" | "system" | "info";

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: NoticeType;
  duration?: number;
}

// Global state for notices (simple implementation for this project scale)
let addNoticeGlobal: (notice: Omit<Notice, "id">) => void = () => {};

export const showNotice = (title: string, message: string, type: NoticeType = "info", duration = 4000) => {
  addNoticeGlobal({ title, message, type, duration });
};

export function NexusNoticeContainer() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const addNotice = useCallback((notice: Omit<Notice, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotices((prev) => [...prev, { ...notice, id }]);

    if (notice.duration !== Infinity) {
      setTimeout(() => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }, notice.duration || 4000);
    }
  }, []);

  useEffect(() => {
    addNoticeGlobal = addNotice;
  }, [addNotice]);

  return (
    <div className="fixed top-5 left-5 z-[10000] flex flex-col gap-4 pointer-events-none perspective-[1000px]">
      <AnimatePresence>
        {notices.map((notice) => {
          const isError = notice.type === "error";
          const barColor = isError ? "#ff4444" : "var(--accent-color, #10b981)"; // Fallback to emerald if variable not set
          const barShadow = isError ? "0 0 15px rgba(255, 68, 68, 0.5)" : "0 0 15px rgba(16, 185, 129, 0.5)";

          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -100, scale: 0.9, marginTop: -15, height: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1, marginTop: 0, height: "auto" }}
              exit={{ opacity: 0, x: -120, scale: 0.8, marginTop: -15, height: 0 }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 25 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.4 },
                height: { duration: 0.3 }
              }}
              className="relative bg-white/[0.05] backdrop-blur-2xl saturate-[180%] p-2.5 pr-6 text-white flex items-center gap-4 w-fit min-w-[300px] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto group"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              {/* Slow Reflection Animation (CSS in global or inline) */}
              <div 
                className="absolute inset-0 border border-transparent pointer-events-none z-0"
                style={{
                  background: "linear-gradient(135deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%, transparent 100%)",
                  backgroundSize: "300% 300%",
                  backgroundPosition: "100% 100%",
                  animation: "slowReflection 8s infinite linear"
                }}
              />
              
              {/* The Vertical Bar */}
              <div 
                className="relative w-1 h-8 rounded-sm overflow-hidden z-10"
                style={{ backgroundColor: barColor, boxShadow: barShadow }}
              >
                {/* Slide Up Animation inside the bar */}
                <div 
                  className="absolute left-0 w-full h-full bg-white opacity-30 shadow-[0_0_10px_white]"
                  style={{ animation: "barSlideUp 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col justify-center z-10 relative">
                <div className="font-display text-base tracking-widest text-white leading-tight uppercase">
                  {notice.title}
                </div>
                <div className="font-body text-sm text-white/90 tracking-wide mt-0.5">
                  {notice.message}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Inject Keyframes needed for the reference animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slowReflection {
            0% { background-position: 200% 200%; }
            100% { background-position: -200% -200%; }
        }
        @keyframes barSlideUp {
            0% { top: 100%; opacity: 0; }
            50% { opacity: 0.6; }
            100% { top: -100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}