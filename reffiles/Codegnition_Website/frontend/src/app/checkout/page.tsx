"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SiteHeader } from "@/components/site-header";
import { UserAvatar } from "@/components/UserAvatar";
import { animate, motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDisplayName } from "@/lib/user-display";
import Link from "next/link";
import { showNotice } from "@/components/NexusNotice";

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    
    const controls = animate(previousValue, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = latest.toFixed(2);
        }
      },
    });
    
    previousValueRef.current = value;

    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>{value.toFixed(2)}</span>;
}

const paymentMethods = ["Visa", "Mastercard", "PayPal", "Amex"];

const PaymentMethods = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % paymentMethods.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
      <span>We accept:</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={paymentMethods[index]}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="font-semibold text-white/80"
        >
          {paymentMethods[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default function CheckoutPage() {
  const { cartItems, totalCost, increaseQuantity, decreaseQuantity } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.address) {
      const initialAddr = {
        id: Date.now(),
        line1: user.address.line1,
        city: user.address.city,
        state: "",
        postalCode: user.address.postalCode,
        country: user.address.country,
      };
      setAddresses([initialAddr]);
      setSelectedAddressId(initialAddr.id);
    }
  }, [user]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showNotice("ERROR", "Geolocation is not supported by your browser.", "error");
      return;
    }

    showNotice("LOCATION", "Detecting precise coordinates...", "info");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const detailedLine1 = result.name || 
                                 (result.housenumber && result.street ? `${result.housenumber} ${result.street}` : 
                                 (result.street || result.address_line1 || result.formatted.split(',')[0]));

            const suggestion = {
              line1: detailedLine1,
              city: result.city || result.suburb || "",
              state: result.state || "",
              postalCode: result.postcode || "",
              country: result.country || "",
            };
            
            if (selectedAddressId) {
              applyGlitchySuggestion(selectedAddressId, suggestion);
            } else {
              const newId = Date.now();
              setAddresses(prev => [...prev, { id: newId, ...suggestion }]);
              setSelectedAddressId(newId);
            }
            
            const accuracyMsg = accuracy < 100 ? "High precision" : "Low precision";
            showNotice("LOCATION DETECTED", `Shipping address updated (${accuracyMsg}).`, "success");
          } else {
            showNotice("ERROR", "Could not resolve your location.", "error");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          showNotice("ERROR", "Failed to resolve address details.", "error");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Location access denied or unavailable.";
        if (error.code === 1) msg = "Access denied. Enable location in settings.";
        else if (error.code === 3) msg = "Detection timed out.";
        showNotice("ERROR", msg, "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const applyGlitchySuggestion = (id: number, suggestion: any) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const targetValues = {
      line1: suggestion.line1 || "",
      city: suggestion.city || "",
      state: suggestion.state || "",
      postalCode: suggestion.postalCode || "",
      country: suggestion.country || ""
    };
    
    let iteration = 0;
    const maxLen = Math.max(...Object.values(targetValues).map(v => v.length));
    
    const interval = setInterval(() => {
      setAddresses(current => current.map(addr => {
        if (addr.id !== id) return addr;
        
        const updated = { ...addr };
        (Object.keys(targetValues) as Array<keyof typeof targetValues>).forEach(field => {
          const target = targetValues[field];
          updated[field] = target.split("").map((letter, index) => {
            if (index < iteration) return target[index];
            if (index < iteration + 3) return chars[Math.floor(Math.random() * chars.length)];
            return " ";
          }).join("");
        });
        return updated;
      }));

      if (iteration >= maxLen) {
        clearInterval(interval);
        setAddresses(current => current.map(addr => {
          if (addr.id !== id) return addr;
          return { ...addr, ...targetValues };
        }));
      }
      iteration += 1;
    }, 25);
  };

  return (
    <main>
      <SiteHeader />
      <section className="flex min-h-screen flex-col items-center justify-center p-6 pt-32">
        <div
          className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg p-12 w-full max-w-4xl overflow-hidden"
          style={{ borderRadius: "1px" }}
        >
          <div className="mb-12 text-center relative">
            <p className="font-body text-xs uppercase text-accent tracking-widest">
              {step === 1 ? "Checkout - Step 1" : "Checkout - Step 2"}
            </p>
            <h1 className="mt-4 font-display text-5xl uppercase tracking-widest text-slate-300">
              {step === 1 ? "Review Your Order" : "Shipping Details"}
            </h1>
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={false}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/50 mb-6">Your cart is empty. Add some items from the marketplace to get started.</p>
                      <Link href="/marketplace" passHref>
                        <motion.a
                          className="inline-block border border-white/15 bg-transparent px-5 py-3 font-display text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-emerald-300/40 hover:bg-emerald-300/10 hover:text-emerald-200"
                          style={{ borderRadius: "1px" }}
                          whileHover={{ scale: 1.05 }}
                        >
                          Explore Marketplace
                        </motion.a>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <motion.ul layout className="space-y-6">
                        <AnimatePresence>
                          {cartItems.map(item => (
                            <motion.li 
                              key={item.name} 
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeOut" } }}
                              transition={{
                                layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                                opacity: { duration: 0.4, ease: "easeOut" },
                                y: { duration: 0.4, ease: "easeOut" }
                              }}
                              className="flex items-center justify-between gap-6 pb-6 border-b border-white/10 last:border-b-0 last:pb-0"
                            >
                              <p className="text-white font-display uppercase tracking-wider text-xl flex-1 truncate">{item.name}</p>
                              <div className="flex items-center gap-4 md:gap-8 shrink-0">
                                <div className="flex items-center gap-2 glass-panel p-1 rounded-full">
                                  <button onClick={() => decreaseQuantity(item.name)} className="h-7 w-7 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white text-lg">-</button>
                                  <span className="w-8 text-center font-mono text-base text-white">{item.quantity}</span>
                                  <button onClick={() => increaseQuantity(item.name)} className="h-7 w-7 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white text-lg">+</button>
                                </div>
                                <p className="font-display text-xl tracking-widest text-white w-24 text-right">${(parseFloat(item.price || "0") * item.quantity).toFixed(2)}</p>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </motion.ul>
                      
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center font-display text-2xl uppercase text-slate-300 tracking-widest">
                          <span>Total Cost</span>
                          <span className="text-white font-mono">
                            $<AnimatedNumber value={totalCost} />
                          </span>
                        </div>
                        
                        <div className="h-[1px] w-full bg-white/10 mt-4 mb-2" />
                        
                        <PaymentMethods />
                      </div>

                      <button 
                        onClick={() => setStep(2)}
                        className="w-full mt-10 p-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-display text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ borderRadius: "1px" }}
                      >
                        Proceed to Shipping
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="glass-panel p-8 mb-8">
                    <h2 className="font-display text-2xl uppercase tracking-widest text-white mb-6">Delivery Information</h2>
                    
                    {!isLoggedIn ? (
                      <div className="text-center py-12 border border-dashed border-white/20 p-8 bg-white/[0.02]">
                        {/* Guest checkout message */}
                      </div>
                    ) : (
                      <div>
                         <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                            {/* User info */}
                         </div>
                         <div className="space-y-4">
                          {addresses.map(addr => (
                            <div 
                              key={addr.id}
                              className={`border p-6 bg-white/5 relative group cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-accent shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/20 hover:border-accent'}`}
                              onClick={() => setSelectedAddressId(addr.id)}
                            >
                              <div className={`absolute top-4 right-4 h-4 w-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-accent bg-accent/20' : 'border-white/50'}`}>
                                {selectedAddressId === addr.id && <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>}
                              </div>
                              <p className="text-white font-display text-lg uppercase tracking-wide mb-2">{user?.name}</p>
                              <p className="text-slate-300 font-body text-sm">{addr.line1}</p>
                              <p className="text-slate-300 font-body text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                              <p className="text-slate-300 font-body text-sm">{addr.country}</p>
                            </div>
                          ))}
                         </div>
                         <div className="mt-6 flex flex-col sm:flex-row gap-4">
                           <button 
                              onClick={() => router.push("/account")}
                              className="w-full sm:w-auto flex-grow border border-white/15 bg-white/[0.04] px-4 py-3 font-display text-xs uppercase tracking-[0.24em] text-white transition hover:bg-white/[0.08]"
                              style={{ borderRadius: "1px" }}
                            >
                             Manage Addresses
                           </button>
                           <button 
                              onClick={handleUseLocation}
                              className="w-full sm:w-auto flex-grow border border-accent/30 bg-accent/5 px-4 py-3 font-display text-xs uppercase tracking-[0.24em] text-accent transition hover:bg-accent/10"
                              style={{ borderRadius: "1px" }}
                            >
                             Use My Location
                           </button>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="w-1/3 p-4 bg-transparent border border-white/20 hover:bg-white/5 text-white font-display text-lg uppercase tracking-widest transition-all" style={{ borderRadius: "1px" }}
                    >
                      Back
                    </button>
                    <button 
                      className="w-2/3 p-4 bg-accent/90 hover:bg-accent border border-accent text-white font-display text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ borderRadius: "1px" }}
                    >
                      Finalize Payment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}