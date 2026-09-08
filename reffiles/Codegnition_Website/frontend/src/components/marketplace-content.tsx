"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarketplaceSidebar from "./marketplace-sidebar";
import XrayTitle from "./XrayTitle";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

interface Item {
  name: string;
  description: string;
  status: string;
  price?: string;
  category?: string;
  offer?: string;
  isPlaceholder?: boolean;
}

const PLACEHOLDER_NAMES = [
  "Project Phoenix", "QuantumLeap CRM", "NexusDB", "Orion Analytics",
  "Helios CMS", "Vanguard Auth", "CipherFlow", "Aether Canvas",
  "Momentum Planner", "EchoWave", "Starlight Suite", "Nova Deploy"
];

const PLACEHOLDER_DESCRIPTIONS = [
  "A robust backend system for managing user authentication, permissions, and API access across multiple client applications.",
  "An interactive data visualization dashboard for analyzing complex business metrics and generating real-time reports.",
  "A lightweight content management system (CMS) designed for developers, offering a git-based workflow and markdown support.",
  "A scalable e-commerce platform with integrated payment gateways, inventory management, and customer relationship tools.",
  "A real-time collaborative whiteboard application for team brainstorming, project planning, and remote workshops.",
  "An automated CI/CD pipeline integration for deploying containerized applications to cloud infrastructure with one-click rollbacks.",
  "A procedural generation tool for creating unique 2D game levels, complete with configurable biomes and asset placement rules.",
  "A subscription management service that handles recurring billing, trial periods, and dunning for SaaS products.",
  "A machine learning model deployment service that provides a REST API for making predictions with versioning and A/B testing.",
  "A cross-platform mobile application shell built with React Native, pre-configured with navigation and state management.",
  "A secure digital asset management system for creative agencies to store, version, and distribute client work.",
  "A community forum platform with moderation tools, user profiles, and gamification features to drive engagement."
];

const PLACEHOLDERS: Item[] = Array.from({ length: 12 }, (_, i) => {
  const placeholderCategories = ["Productivity", "Web Presence", "Creative Tools", "Business Automation"];
  const price = 150 + ((i * 211) % 850);
  const catIndex = (i * 3) % placeholderCategories.length;
  return {
    name: PLACEHOLDER_NAMES[i],
    description: PLACEHOLDER_DESCRIPTIONS[i],
    status: "Discovery",
    price: price.toString(),
    category: placeholderCategories[catIndex],
    offer: (i % 4 === 0) ? "Special" : undefined,
    isPlaceholder: true,
  };
});

const customBuildTitles = ["Custom Build", "Build your own software"];

interface MarketplaceContentProps {
  items: Item[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function MarketplaceContent({
  items,
  isSidebarOpen,
  setIsSidebarOpen,
}: MarketplaceContentProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const [draftPrice, setDraftPrice] = useState<number>(2000);
  const [draftOffers, setDraftOffers] = useState<boolean>(false);
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  
  const [appliedPrice, setAppliedPrice] = useState<number>(2000);
  const [appliedOffers, setAppliedOffers] = useState<boolean>(false);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  
  const [displayItems, setDisplayItems] = useState<Item[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex(prevIndex => (prevIndex + 1) % customBuildTitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filteredRealItems = items.filter((item) => {
      const itemPrice = item.price ? parseInt(item.price) : 0;
      if (itemPrice > appliedPrice) return false;
      if (appliedOffers && item.offer !== "Special") return false;
      if (appliedCategories.length > 0 && item.category && !appliedCategories.includes(item.category)) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const placeholdersNeeded = 12 - filteredRealItems.length;
    const finalItems = [...filteredRealItems];
    if (placeholdersNeeded > 0) {
      finalItems.push(...PLACEHOLDERS.slice(0, placeholdersNeeded));
    }
    setDisplayItems(finalItems);
  }, [items, appliedPrice, appliedOffers, appliedCategories, searchQuery]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAddToCart = (item: Item) => {
    addToCart({ name: item.name, price: item.price });
    setJustAdded(item.name);
  };

  const hasChanges = useMemo(() => 
    draftPrice !== appliedPrice || 
    draftOffers !== appliedOffers || 
    draftCategories.length !== appliedCategories.length || 
    !draftCategories.every(c => appliedCategories.includes(c)),
    [draftPrice, draftOffers, draftCategories, appliedPrice, appliedOffers, appliedCategories]
  );

  const handleApply = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setAppliedPrice(draftPrice);
      setAppliedOffers(draftOffers);
      setAppliedCategories(draftCategories);
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <div className="relative pt-32 min-h-screen">
      <MarketplaceSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        price={draftPrice}
        setPrice={setDraftPrice}
        offers={draftOffers}
        setOffers={setDraftOffers}
        categories={draftCategories}
        setCategories={setDraftCategories}
        hasChanges={hasChanges}
        onApply={handleApply}
      />

      <div className="w-full">
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="relative glass-panel rounded-xl p-8 text-center mb-12 overflow-hidden bg-white/5 border border-white/10 transition-colors duration-1000 hover:bg-white/10 isolate">
            {/* Ambient glass reaction */}
            <motion.div 
              className="pointer-events-none absolute -inset-y-20 w-[120px] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl -skew-x-[30deg] z-0"
              animate={{ left: ["-30%", "130%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Thicker, softer reflection */}
            <motion.div 
              className="pointer-events-none absolute -inset-y-20 w-[25px] bg-white/20 blur-[4px] shadow-[0_0_20px_rgba(255,255,255,0.4)] -skew-x-[30deg] z-0"
              animate={{ left: ["-30%", "130%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            
            <div className="relative z-10">
              <div className="h-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentTitleIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="font-display text-3xl uppercase text-white tracking-wider"
                  >
                    {customBuildTitles[currentTitleIndex]}
                  </motion.h2>
                </AnimatePresence>
              </div>
              <Link href="/custom-order" passHref>
                <motion.a
                  className="mt-4 inline-block w-full max-w-md rounded-lg bg-accent/25 py-4 font-body text-sm uppercase tracking-widest text-accent-light border border-accent/60"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(16, 185, 129, 0.5)" }}
                >
                  Curate a Software
                </motion.a>
              </Link>
            </div>
          </div>

          <hr className="border-white/10 my-12" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <p className="font-body text-xs uppercase text-accent mb-4">Our other products</p>
                <XrayTitle text="Current Service Tracks" className="font-display text-5xl uppercase text-white h-[60px] sm:h-[100px] w-[800px] max-w-full" />
              </div>
              <div className="relative ml-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-panel bg-black/50 backdrop-blur-lg rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <p className="mt-5 font-body text-base leading-7 text-slate-300 max-w-3xl">
              Browse our selection of premium software solutions. Filter by category, price, and special offers to find exactly what you need.
            </p>
            
            <motion.div layout className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-3 min-h-[600px]">
              <AnimatePresence>
                {displayItems.map((item) => (
                  <motion.article
                    key={item.isPlaceholder ? `placeholder-${item.name}` : item.name}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }}
                    transition={{
                      opacity: { duration: 0.3, ease: "easeOut" },
                      scale: { duration: 0.3, ease: "easeOut" },
                      y: { duration: 0.3, ease: "easeOut" },
                      layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="glass-panel flex flex-col justify-between rounded-xl p-6 hover-glow transition-all duration-300 hover:-translate-y-2 h-[280px]"
                  >
                    <div>
                      <h2 className="font-display text-xl uppercase text-white tracking-wide">{item.name}</h2>
                      <p className="mt-4 font-body text-sm leading-6 text-slate-400 line-clamp-3">{item.description}</p>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          {item.price && (<span className="font-display text-2xl text-white">${item.price}</span>)}
                        </div>
                        {item.offer === "Special" && (
                          <div className="text-right">
                            <span className="inline-block rounded bg-accent/20 px-2 py-0.5 font-body text-[10px] uppercase text-accent whitespace-nowrap">Special Offer</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                        <div className="flex flex-col gap-1 w-2/3">
                          <span className="font-body text-xs uppercase text-accent tracking-wider truncate">{item.status}</span>
                          {item.category && (<span className="font-body text-[10px] text-slate-500 uppercase tracking-widest truncate">{item.category}</span>)}
                        </div>
                        <div className="flex justify-end w-1/3">
                          <motion.button 
                            onClick={() => handleAddToCart(item)}
                            whileTap={{ scale: 0.90 }}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/20 hover:scale-105 group relative" aria-label="Add to cart"
                          >
                            <AnimatePresence>
                              {justAdded === item.name ? (
                                <motion.div
                                  key="checkmark"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="plus"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 group-hover:text-white transition-colors">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                  </svg>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
