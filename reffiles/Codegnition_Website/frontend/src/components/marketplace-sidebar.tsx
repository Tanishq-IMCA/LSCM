"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MarketplaceSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  price: number;
  setPrice: (price: number) => void;
  offers: boolean;
  setOffers: (offers: boolean) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
  hasChanges: boolean;
  onApply: () => void;
}

const CATEGORIES = [
  "Business Automation",
  "Creative Tools",
  "Web Presence",
  "Productivity",
];

const MarketplaceSidebar = ({
  isOpen,
  setIsOpen,
  price,
  setPrice,
  offers,
  setOffers,
  categories,
  setCategories,
  hasChanges,
  onApply,
}: MarketplaceSidebarProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryChange = (category: string) => {
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setCategories(newCategories);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            style={{ willChange: "transform" }} // Performance Optimization: Promote to own layer
            className="glass-panel bg-black/50 backdrop-blur-lg fixed left-0 top-0 z-50 h-full w-[340px] border-r border-white/10 shadow-2xl flex flex-col"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-24 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto px-8 pt-32 pb-10 flex flex-col gap-10">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-widest text-white">Filters</h2>
                <div className="mt-2 h-[1px] w-full bg-gradient-to-r from-accent to-transparent opacity-50" />
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label htmlFor="price" className="font-body text-sm uppercase tracking-widest text-accent">
                    Max Price
                  </label>
                  <span className="font-display text-lg text-white">${price}</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-white/10 border border-white/10">
                  <div className="absolute h-full bg-accent/80 rounded-full" style={{ width: `${(price / 2000) * 100}%` }} />
                  <div className="absolute top-1/2 h-6 w-2 -translate-y-1/2 -translate-x-1/2 rounded-[1px] bg-white/80 border border-white shadow-sm pointer-events-none" style={{ left: `${(price / 2000) * 100}%` }} />
                  <input type="range" id="price" min="0" max="2000" step="50" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Offers Checkbox */}
              <div>
                <h3 className="font-body text-sm uppercase tracking-widest text-accent mb-4">Special Offers</h3>
                <label className="group relative flex cursor-pointer items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${offers ? 'border-accent bg-accent/20' : 'border-white/30 group-hover:border-white/60'}`}>
                     {offers && <div className="h-2.5 w-2.5 rounded-sm bg-accent" />}
                  </div>
                  <input type="checkbox" checked={offers} onChange={(e) => setOffers(e.target.checked)} className="absolute opacity-0" />
                  <span className="font-body text-sm text-slate-300 group-hover:text-white transition-colors">Only show items with offers</span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-body text-sm uppercase tracking-widest text-accent mb-4">Software Type</h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="group relative flex cursor-pointer items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${categories.includes(category) ? 'border-accent bg-accent/20' : 'border-white/30 group-hover:border-white/60'}`}>
                         {categories.includes(category) && <div className="h-2.5 w-2.5 rounded-sm bg-accent" />}
                      </div>
                      <input type="checkbox" checked={categories.includes(category)} onChange={() => handleCategoryChange(category)} className="absolute opacity-0" />
                      <span className="font-body text-sm text-slate-300 group-hover:text-white transition-colors">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Apply Button Section */}
            <div className="px-8 pb-8 mt-auto">
              <motion.button
                layout
                onClick={() => { if (hasChanges) onApply(); }}
                whileHover={hasChanges ? { scale: 1.03, boxShadow: "0 0 35px rgba(16, 185, 129, 0.5)" } : {}}
                whileTap={hasChanges ? { scale: 0.98 } : {}}
                animate={{
                  backgroundColor: hasChanges ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.05)",
                  borderColor: hasChanges ? "rgba(16, 185, 129, 0.6)" : "rgba(255, 255, 255, 0.1)",
                  color: hasChanges ? "rgba(110, 231, 183, 1)" : "rgba(255, 255, 255, 0.3)",
                  boxShadow: hasChanges ? "0 0 25px rgba(16, 185, 129, 0.3)" : "0 0 0px rgba(0,0,0,0)",
                  height: hasChanges ? 64 : 48,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`w-full rounded-lg font-body text-xs uppercase tracking-widest backdrop-blur-md flex items-center justify-center border ${hasChanges ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <AnimatePresence mode="wait">
                  {hasChanges ? (
                    <motion.span key="changes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      Apply Filter Changes
                    </motion.span>
                  ) : (
                    <motion.span key="no-changes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      Filters Applied
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MarketplaceSidebar;