"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import Link from "next/link";
import { countryCodes } from "@/lib/country-codes";
import { showNotice } from "@/components/NexusNotice";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AnimatedExclamationIcon } from "@/components/AnimatedExclamationIcon";

// Import custom styles for themed dropdowns
import "../custom-styles.css";

// Debounce hook for search performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Mock address type with validation flag
type Address = {
  id: number;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  invalidFields?: Record<string, boolean>;
};

type GeoapifySuggestion = {
  address_line1: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  formatted: string;
};

export default function AccountPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  // State for editable fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [countryCode, setCountryCode] = useState(user?.countryCode || "+1");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "Prefer not to say");
  const [company, setCompany] = useState(user?.company || "");
  const [addresses, setAddresses] = useState<Address[]>(
    user ? [{ ...user.address, id: user.address.id || 1000, invalidFields: {} }] : []
  );
  const [primaryAddressId, setPrimaryAddressId] = useState(user?.address.id || 1000);
  
  const [isDirty, setIsDirty] = useState(false);
  
  // Autocomplete state
  const [activeInputId, setActiveInputId] = useState<number | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setSuggestions([]);
        setActiveInputId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchTerm.trim() && activeField === 'line1') {
      const query = encodeURIComponent(debouncedSearchTerm);
      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      // Using Geoapify with a fallback or ensuring it's called correctly for global results
      fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&format=json&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          setSuggestions(data.results || []);
        })
        .catch(error => {
          console.error('Error fetching address suggestions:', error);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm, activeField]);

  // Effect to update state when user logs in/out
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setCountryCode(user.countryCode || "+1");
      setAge(user.age || "");
      setGender(user.gender || "Prefer not to say");
      setCompany(user.company || "");
      setAddresses([{ ...user.address, id: user.address.id || 1000, invalidFields: {} }]);
      setPrimaryAddressId(user.address.id || 1000);
    } else {
      // Reset all fields on logout
      setName("");
      setEmail("");
      setPhone("");
      setCountryCode("+1");
      setAge("");
      setGender("Prefer not to say");
      setCompany("");
      setAddresses([]);
      setPrimaryAddressId(null);
    }
  }, [user]);

  // Check if any field has changed
  useEffect(() => {
    if (!user) return;
    const hasChanged =
      name !== user.name ||
      email !== user.email ||
      phone !== (user.phone || "") ||
      countryCode !== (user.countryCode || "+1") ||
      age !== (user.age || "") ||
      gender !== (user.gender || "Prefer not to say") ||
      company !== (user.company || "") ||
      JSON.stringify(addresses.map(({invalidFields, ...rest}) => rest)) !== JSON.stringify([user.address]) ||
      primaryAddressId !== user.address.id;
    setIsDirty(hasChanged);
  }, [name, email, phone, countryCode, age, gender, company, addresses, primaryAddressId, user]);

  const handleSaveChanges = () => {
    // UI-only: log changes and reset dirty state
    setIsDirty(false);
    showNotice("PROFILE UPDATED", "Settings synchronized to cloud core.", "success");
  };

  const addAddress = () => {
    if (addresses.length < 3) {
      const newAddress: Address = {
        id: Date.now(),
        line1: "",
        city: "",
        postalCode: "",
        country: "",
        invalidFields: {},
      };
      setAddresses([...addresses, newAddress]);
      showNotice("ADDRESS ADDED", "New shipping location initialized.", "info");
    } else {
      showNotice("SYSTEM ALERT", "Maximum address limit reached.", "warn");
    }
  };

  const deleteAddress = (id: number) => {
    if (addresses.length === 1) {
      showNotice("CRITICAL", "Cannot remove final active address.", "error");
      return;
    }
    
    setAddresses(addresses.filter(addr => addr.id !== id));
    if (primaryAddressId === id) {
      const newPrimary = addresses.find(addr => addr.id !== id)!.id;
      setPrimaryAddressId(newPrimary);
      showNotice("PRIMARY SHIFTED", "Fallback address automatically engaged.", "system");
    } else {
      showNotice("ADDRESS PURGED", "Shipping location removed from profile.", "success");
    }
  };

  const handleAddressSearch = (id: number, field: string, value: string) => {
    setActiveInputId(id);
    setActiveField(field);
    setSearchTerm(value);
  };

  const detectLocation = (id: number) => {
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
          // Increase accuracy by using enableHighAccuracy and checking accuracy field
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            
            // Try to build a more detailed address line
            // Prefer name (landmark) if available, then house number + street
            const detailedLine1 = result.name || 
                                 (result.housenumber && result.street ? `${result.housenumber} ${result.street}` : 
                                 (result.street || result.address_line1 || result.formatted.split(',')[0]));

            const suggestion: GeoapifySuggestion = {
              address_line1: detailedLine1,
              city: result.city || result.suburb || "",
              postcode: result.postcode || "",
              country: result.country || "",
              state: result.state || "",
              formatted: result.formatted || ""
            };
            
            // Clear search state
            setSearchTerm("");
            setSuggestions([]);
            setActiveInputId(null);
            setActiveField(null);
            
            applyGlitchySuggestion(id, suggestion);
            
            const accuracyMsg = accuracy < 100 ? "High precision" : "Low precision";
            showNotice("LOCATION DETECTED", `Address resolved (${accuracyMsg}).`, "success");
          } else {
            showNotice("ERROR", "Could not resolve your address.", "error");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          showNotice("ERROR", "Failed to detect address details.", "error");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Location access denied or unavailable.";
        if (error.code === 1) msg = "Location access denied. Please enable it in settings.";
        else if (error.code === 3) msg = "Location detection timed out.";
        showNotice("ERROR", msg, "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const applySuggestion = (id: number, suggestion: GeoapifySuggestion) => {
    setSearchTerm("");
    setSuggestions([]);
    setActiveInputId(null);
    setActiveField(null);
    applyGlitchySuggestion(id, suggestion);
  };

  const applyGlitchySuggestion = (id: number, suggestion: GeoapifySuggestion) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const targetValues = {
      line1: suggestion.address_line1 || "",
      city: suggestion.city ? (suggestion.state ? `${suggestion.city}, ${suggestion.state}` : suggestion.city) : "",
      postalCode: suggestion.postcode || "",
      country: suggestion.country || ""
    };
    
    let iteration = 0;
    const maxLen = Math.max(...Object.values(targetValues).map(v => v.length));
    
    const interval = setInterval(() => {
      setAddresses(current => current.map(addr => {
        if (addr.id !== id) return addr;
        
        const updated = { ...addr, invalidFields: {} };
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
        // Final set to be sure
        setAddresses(current => current.map(addr => {
          if (addr.id !== id) return addr;
          return {
            ...addr,
            ...targetValues,
            invalidFields: {}
          };
        }));
      }
      iteration += 1;
    }, 25);
  };

  const updateAddress = (id: number, field: keyof Address, value: string) => {
    setAddresses(currentAddresses => currentAddresses.map(addr => {
      if (addr.id !== id) return addr;

      const updatedAddr = { ...addr, [field]: value };
      if (!updatedAddr.invalidFields) updatedAddr.invalidFields = {};

      // Smart Validation against mock DB
      if (['postalCode', 'city', 'country'].includes(field)) {
        const val = value.trim().toLowerCase();

        if (val.length >= 3) {
           // The validation logic is removed as we are now using a public API
           updatedAddr.invalidFields[field] = false;
        } else {
           updatedAddr.invalidFields[field] = false;
        }
      }

      return updatedAddr;
    }));
  };

  const setPrimary = (id: number) => {
    setPrimaryAddressId(id);
    showNotice("SYSTEM ROUTING", "Primary dispatch coordinate updated.", "system");
  };

  return (
    <main>
      <SiteHeader />
      <section className="flex min-h-screen flex-col items-center justify-center p-6 pt-32 pb-24">
        <div
          className="w-full max-w-6xl overflow-hidden border border-white/10 bg-black/25 p-8 shadow-lg backdrop-blur-xl md:p-12"
          style={{ borderRadius: "1px" }}
        >
          {!isLoggedIn || !user ? (
            <div className="text-center py-20">
              <p className="font-body text-xs uppercase tracking-[0.4em] text-accent">
                Account Access
              </p>
              <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.14em] text-white">
                Sign In Required
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300">
                This profile view is only for signed-in customers.
              </p>
              <button
                type="button"
                onClick={() => router.push("/authentication")}
                className="mt-8 border border-white/20 bg-white/5 px-8 py-4 font-display text-sm uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
                style={{ borderRadius: "1px" }}
              >
                Go To Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Header */}
              <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <UserAvatar name={user.name} size="lg" />
                  <div>
                    <h1 className="font-display text-4xl uppercase tracking-[0.12em] text-white">
                      Account Settings
                    </h1>
                    <p className="mt-2 text-sm uppercase tracking-[0.24em] text-white/45">
                      Manage your profile and preferences
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleSaveChanges}
                  disabled={!isDirty}
                  className="border px-6 py-3 font-display text-xs uppercase tracking-[0.28em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderRadius: "1px" }}
                  animate={{
                    borderColor: isDirty ? "rgba(16, 185, 129, 0.6)" : "rgba(255, 255, 255, 0.15)",
                    backgroundColor: isDirty ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    color: isDirty ? "rgba(110, 231, 183, 1)" : "rgba(255, 255, 255, 0.7)",
                    boxShadow: isDirty ? "0 0 20px rgba(16, 185, 129, 0.3)" : "none",
                  }}
                  whileHover={isDirty ? { scale: 1.05, boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)" } : {}}
                >
                  Save Changes
                </motion.button>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Details */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="border border-white/10 bg-white/[0.03] p-6" style={{ borderRadius: "1px" }}>
                    <h2 className="font-display text-lg uppercase tracking-[0.2em] text-white">Profile Information</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:bg-black/60"
                          style={{ borderRadius: "1px" }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:bg-black/60"
                          style={{ borderRadius: "1px" }}
                        />
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Phone Number</label>
                        <div className="flex border border-white/10 focus-within:border-accent/60 transition-colors bg-black/40 focus-within:bg-black/60">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-transparent pl-3 pr-8 py-3 text-white/80 text-sm outline-none border-r border-white/10 custom-scrollbar max-w-[120px]"
                          >
                            {countryCodes.map(c => (
                              <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-transparent px-4 py-3 text-white outline-none"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Age</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:bg-black/60"
                          style={{ borderRadius: "1px" }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:bg-black/60"
                          style={{ borderRadius: "1px" }}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Non-binary</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Company (Optional)</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-accent/60 focus:bg-black/60"
                          style={{ borderRadius: "1px" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/10 bg-white/[0.03] p-6" style={{ borderRadius: "1px" }}>
                    <div className="flex justify-between items-center">
                      <h2 className="font-display text-lg uppercase tracking-[0.2em] text-white">Saved Addresses</h2>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={addAddress}
                          disabled={addresses.length >= 3}
                          className="text-xs uppercase tracking-widest text-accent transition hover:text-white disabled:opacity-30 disabled:hover:text-accent"
                        >
                          + Add ({addresses.length}/3)
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 space-y-6">
                      <AnimatePresence mode="popLayout">
                        {addresses.map(addr => {
                          const hasInvalidFields = addr.invalidFields && Object.values(addr.invalidFields).some(v => v === true);

                          return (
                          <motion.div
                            key={addr.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="border bg-black/30 p-5 relative transition-all duration-300"
                            style={{ 
                              borderRadius: "1px",
                              borderColor: primaryAddressId === addr.id ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.1)",
                              boxShadow: primaryAddressId === addr.id ? "0 0 20px rgba(16, 185, 129, 0.1)" : "none"
                            }}
                          >
                            {primaryAddressId === addr.id && (
                              <div className="absolute -top-2 -right-2 bg-accent text-slate-950 text-[9px] font-bold uppercase tracking-widest px-3 py-1 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                Primary
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-5 relative">
                              {/* Smart Address Autocomplete Wrapper */}
                              <div className="col-span-2 space-y-1 relative" ref={activeInputId === addr.id ? autocompleteRef : null}>
                                <label className="text-[9px] uppercase tracking-widest text-white/40 flex justify-between items-center">
                                  <span>Street Address / Auto-search</span>
                                  <div className="flex items-center gap-3">
                                    {activeInputId === addr.id && activeField === 'line1' && searchTerm && (
                                      <span className="text-accent animate-pulse">Searching...</span>
                                    )}
                                    <button 
                                      type="button"
                                      onClick={() => detectLocation(addr.id)}
                                      className="flex items-center gap-1.5 text-[10px] bg-accent/20 text-accent px-3 py-1 border border-accent/30 hover:bg-accent hover:text-slate-950 transition-all uppercase font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                      Auto-Detect
                                    </button>
                                  </div>
                                </label>
                                <input 
                                  placeholder="Start typing an address..."
                                  type="text" 
                                  value={addr.line1} 
                                  onChange={(e) => {
                                    updateAddress(addr.id, 'line1', e.target.value);
                                    handleAddressSearch(addr.id, 'line1', e.target.value);
                                  }} 
                                  onFocus={(e) => handleAddressSearch(addr.id, 'line1', e.target.value)}
                                  className="w-full bg-white/[0.02] border border-white/10 p-3 outline-none text-sm text-white focus:border-accent/50 focus:bg-white/[0.05] transition-all" 
                                />
                                
                                {/* Simulated Autocomplete Dropdown */}
                                <AnimatePresence>
                                  {activeInputId === addr.id && suggestions.length > 0 && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      className="absolute top-full left-0 w-full z-50 mt-1 bg-[#151515] border border-white/10 shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                      {suggestions.map((suggestion, idx) => (
                                        <div 
                                          key={idx}
                                          onClick={() => applySuggestion(addr.id, suggestion)}
                                          className="p-3 border-b border-white/5 last:border-b-0 hover:bg-white/10 cursor-pointer transition-colors"
                                        >
                                          <p className="text-white text-sm">{suggestion.address_line1 || suggestion.formatted.split(',')[0]}</p>
                                          <p className="text-white/50 text-xs mt-0.5">{suggestion.city}{suggestion.state ? `, ${suggestion.state}` : ""} {suggestion.postcode}</p>
                                          <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{suggestion.country}</p>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              
                              <div className="space-y-1 relative">
                                <label className="text-[9px] uppercase tracking-widest text-white/40">Postal / Zip Code</label>
                                <div className="relative">
                                  <input
                                    placeholder="ZIP"
                                    type="text"
                                    value={addr.postalCode}
                                    onChange={(e) => {
                                      updateAddress(addr.id, 'postalCode', e.target.value);
                                    }}
                                    className={`w-full bg-white/[0.02] border p-3 outline-none text-sm text-white transition-all pr-10 ${
                                      addr.invalidFields?.postalCode ? 'border-amber-500/50 focus:border-amber-500 bg-amber-500/5 text-amber-100' : 'border-white/10 focus:border-accent/50 focus:bg-white/[0.05]'
                                    }`}
                                  />
                                  {addr.invalidFields?.postalCode && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" title="Field could not be verified">
                                      <AnimatedExclamationIcon />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-1 relative">
                                <label className="text-[9px] uppercase tracking-widest text-white/40">City / State</label>
                                <div className="relative">
                                  <input
                                    placeholder="City"
                                    type="text"
                                    value={addr.city}
                                    onChange={(e) => {
                                        updateAddress(addr.id, 'city', e.target.value);
                                    }}
                                    className={`w-full bg-white/[0.02] border p-3 outline-none text-sm text-white transition-all pr-10 ${
                                      addr.invalidFields?.city ? 'border-amber-500/50 focus:border-amber-500 bg-amber-500/5 text-amber-100' : 'border-white/10 focus:border-accent/50 focus:bg-white/[0.05]'
                                    }`}
                                  />
                                  {addr.invalidFields?.city && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" title="Field could not be verified">
                                      <AnimatedExclamationIcon />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="col-span-2 space-y-1 relative">
                                <label className="text-[9px] uppercase tracking-widest text-white/40">Country</label>
                                <div className="relative">
                                  <select
                                    value={addr.country}
                                    onChange={(e) => updateAddress(addr.id, 'country', e.target.value)}
                                    className={`w-full bg-white/[0.02] border p-3 outline-none text-sm text-white transition-all appearance-none pr-10 ${
                                      addr.invalidFields?.country ? 'border-amber-500/50 focus:border-amber-500 bg-amber-500/5 text-amber-100' : 'border-white/10 focus:border-accent/50 focus:bg-white/[0.05]'
                                    }`}
                                  >
                                    <option value="">Select Country</option>
                                    {countryCodes.map(c => <option key={c.code} value={c.name} className="bg-slate-900 text-white">{c.name}</option>)}
                                  </select>
                                  {addr.invalidFields?.country && (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" title="Field could not be verified">
                                      <AnimatedExclamationIcon />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {hasInvalidFields && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 text-[10px] text-amber-200 uppercase tracking-widest bg-amber-950/40 border border-amber-500/20 p-2.5 flex items-center gap-3 overflow-hidden"
                                >
                                  <div className="text-amber-500 shrink-0"><AnimatedExclamationIcon /></div>
                                  <div>
                                    <span className="block font-bold">Address could not be verified</span>
                                    <span className="block text-amber-200/70 mt-0.5" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Payments or delivery may encounter issues.</span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                              <button 
                                onClick={() => setPrimary(addr.id)} 
                                className={`text-[11px] uppercase tracking-[0.2em] transition-all ${
                                  primaryAddressId === addr.id ? 'text-white/20 cursor-not-allowed' : 'text-accent hover:text-accent/70'
                                }`}
                                disabled={primaryAddressId === addr.id}
                              >
                                Set as Primary
                              </button>
                              
                              <button 
                                onClick={() => deleteAddress(addr.id)} 
                                className={`text-[11px] uppercase tracking-[0.2em] transition-all ${
                                  addresses.length === 1 ? 'text-white/10 cursor-not-allowed' : 'text-rose-500 hover:text-rose-400'
                                }`}
                                disabled={addresses.length === 1}
                              >
                                Remove
                              </button>
                            </div>
                          </motion.div>
                        );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right Column: Session Controls */}
                <div className="border border-white/10 bg-white/[0.03] p-6 h-fit sticky top-32" style={{ borderRadius: "1px" }}>
                  <h2 className="font-display text-lg uppercase tracking-[0.2em] text-white">
                    Session Controls
                  </h2>
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/custom-order"
                      className="block border border-white/10 bg-black/40 px-4 py-4 font-display text-xs uppercase tracking-[0.26em] text-white transition hover:border-accent/40 hover:bg-white/[0.04]"
                      style={{ borderRadius: "1px" }}
                    >
                      New Custom Order
                    </Link>
                    <Link
                      href="/marketplace"
                      className="block border border-white/10 bg-black/40 px-4 py-4 font-display text-xs uppercase tracking-[0.26em] text-white transition hover:border-accent/40 hover:bg-white/[0.04]"
                      style={{ borderRadius: "1px" }}
                    >
                      Marketplace
                    </Link>
                    <ConfirmButton
                      onConfirm={() => {
                        logout();
                        router.push("/authentication");
                      }}
                      className="w-full border border-white/10 bg-transparent px-4 py-4 font-display text-xs uppercase tracking-[0.26em] text-white/70 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                      style={{ borderRadius: "1px" }}
                    >
                      Sign Out
                    </ConfirmButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}