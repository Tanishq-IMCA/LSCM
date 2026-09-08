"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import { UserAvatar } from "@/components/UserAvatar";
import { ConfirmButton } from "@/components/ConfirmButton";

type ProfilePanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/35"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="absolute right-8 top-24 z-50 w-full max-w-[22rem] border border-white/10 bg-black/70 p-5 shadow-2xl backdrop-blur-xl"
            style={{ borderRadius: "10px" }}
          >
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <UserAvatar name={user.name} size="md" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg uppercase tracking-[0.16em] text-white">
                  {getUserDisplayName(user.name)}
                </p>
                <p className="truncate text-xs uppercase tracking-[0.24em] text-white/45">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Link
                href="/account"
                onClick={onClose}
                className="block border border-white/10 bg-white/[0.03] px-4 py-3 font-display text-xs uppercase tracking-[0.28em] text-white transition hover:border-white/25 hover:bg-white/[0.06]"
                style={{ borderRadius: "8px" }}
              >
                Open Profile
              </Link>
              <ConfirmButton
                onConfirm={() => {
                  logout();
                  onClose();
                }}
                className="w-full border border-white/10 bg-transparent px-4 py-3 font-display text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-rose-300/40 hover:bg-rose-300/10 hover:text-rose-200"
                style={{ borderRadius: "8px" }}
              >
                Sign Out
              </ConfirmButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}