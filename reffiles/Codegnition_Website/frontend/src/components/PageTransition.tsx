"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // In Next.js App Router, using AnimatePresence with mode="wait" causes
  // the exiting page to render the new page's content as it fades out, 
  // resulting in a "flash" or "fading out" of the new page.
  // Using a mount-only animation is the most stable approach without
  // complex router freezing hacks.
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}