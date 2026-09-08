'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartPanel } from "@/components/CartPanel";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { getUserDisplayName } from "@/lib/user-display";
import { ProfilePanel } from "@/components/ProfilePanel";

type SiteHeaderProps = {
  current?: "home" | "marketplace" | "about";
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

const navItems = [
  { href: "/", label: "Home", key: "home" },
  { href: "/marketplace", label: "Marketplace", key: "marketplace" },
  { href: "/about", label: "About Us", key: "about" },
] as const;

const authLabels = ["Sign In", "Login"];

export function SiteHeader({ current, isSidebarOpen, onToggleSidebar }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hold-to-navigate state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const [authLabelIndex, setAuthLabelIndex] = useState(0);

  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    if (isLoggedIn) return;

    const interval = setInterval(() => {
      setAuthLabelIndex(prev => (prev + 1) % authLabels.length);
    }, 4000); // 4 seconds interval to give it some breathing room
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    // Only trigger on left click
    if ('button' in e && e.button !== 0) return;
    
    setIsHolding(true);
    setHoldProgress(0);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Hold complete
        setIsHolding(false);
        router.push('/admin/login');
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const endHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate glow style based on hold progress
  const glowStyle = isHolding
    ? {
        textShadow: `0 0 ${10 + (holdProgress / 100) * 40}px rgba(255, 255, 255, ${0.5 + (holdProgress / 100) * 0.5}), 0 0 ${20 + (holdProgress / 100) * 80}px rgba(59, 130, 246, ${0.5 + (holdProgress / 100) * 0.5})`,
        transform: `scale(${1 + (holdProgress / 100) * 0.05})`,
        transition: 'none', // Remove transition for smooth frame updates
      }
    : {
        transition: 'text-shadow 0.3s ease, transform 0.3s ease',
      };


  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-transparent">
        <div className="mx-auto flex items-center justify-between px-8 py-6">
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl lg:text-4xl uppercase tracking-wider text-white hover:opacity-80 stencil-text swish-reflection relative inline-block cursor-pointer select-none"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onTouchCancel={endHold}
            style={glowStyle}
            draggable={false}
          >
            CODEGNITION
            {isHolding && (
              <div 
                className="absolute -bottom-2 left-0 h-1 bg-blue-500 rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${holdProgress}%`, opacity: holdProgress > 5 ? 1 : 0 }}
              />
            )}
          </Link>
          <div className="flex items-center gap-6 md:gap-8">
            {isLoggedIn && user ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen((currentState) => !currentState)}
                className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-2 py-2 text-white transition hover:border-white/25 hover:bg-white/[0.06]"
                style={{ borderRadius: "10px" }}
              >
                <UserAvatar name={user.name} size="sm" />
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-[7ch] truncate font-display text-xs uppercase tracking-[0.24em] text-white">
                    {getUserDisplayName(user.name)}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                    Profile
                  </p>
                </div>
              </button>
            ) : (
              <Link
                href="/authentication"
                className="flex items-center justify-center text-lg uppercase tracking-widest text-white/80 transition hover:text-white smooth-glow relative h-8 min-w-[85px]"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={authLabelIndex}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.4 }}
                    className="absolute"
                  >
                    {authLabels[authLabelIndex]}
                  </motion.span>
                </AnimatePresence>
              </Link>
            )}
            {current === "marketplace" && (
              <button
                onClick={onToggleSidebar}
                className="hidden md:block text-lg uppercase tracking-widest text-white/80 transition hover:text-white smooth-glow"
              >
                Filters
              </button>
            )}
            <Link
              href="/contact"
              className="hidden md:block text-lg uppercase tracking-widest text-white/80 transition hover:text-white smooth-glow"
            >
              Contact Us
            </Link>
            
            <div className="flex items-center gap-4 border-l border-white/20 pl-4 ml-2">
              {/* Cart Icon with Badge */}
              <button 
                onClick={toggleCart}
                className="relative group p-2 hover:bg-white/5 rounded-full transition-colors focus:outline-none"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover:text-white transition-colors">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      key={itemCount} // Re-animate on change
                      className="absolute top-0 right-0 h-4 min-w-[1rem] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center -translate-y-1/4 translate-x-1/4 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Main Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group relative flex h-10 w-10 flex-col items-center justify-center gap-2 focus:outline-none"
              >
                <span
                  className={`h-[1px] w-8 bg-white transition-all duration-300 ${
                    isMenuOpen ? "translate-y-[9px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-[1px] w-8 bg-white transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-[1px] w-8 bg-white transition-all duration-300 ${
                    isMenuOpen ? "-translate-y-[9px] -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Adjusted Dropdown Menu with increased frostiness */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: isMenuOpen ? "0%" : "-100%" }}
        transition={{ type: "tween", duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ willChange: "transform" }}
        className={`fixed left-0 top-0 z-40 w-full h-[40vh] glass-panel bg-black/60 backdrop-blur-3xl border-b border-white/10 shadow-2xl`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-6 mt-10">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`font-display text-4xl uppercase tracking-widest text-white transition-all duration-500 smooth-glow flipping-glow ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {item.label.split("").map((char, i) => (
                <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </Link>
          ))}
        </div>
      </motion.div>
      
      {/* Interactive Cart Panel */}
      <CartPanel />
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}