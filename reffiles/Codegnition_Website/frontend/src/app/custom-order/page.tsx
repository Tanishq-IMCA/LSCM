"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";

import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/context/CartContext";

function AnimatedCurrency({ value }: { value: number }) {
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

const buildTracks = [
  {
    name: "Launch Site",
    label: "Launch Site",
    description: "Fast brand, product, or conversion-focused websites.",
    basePrice: 899,
  },
  {
    name: "Client Portal",
    label: "Client Portal",
    description: "Account systems, dashboards, and private client flows.",
    basePrice: 1499,
  },
  {
    name: "Operations System",
    label: "Operations System",
    description: "Internal workflows, automations, and admin tooling.",
    basePrice: 2299,
  },
  {
    name: "Platform Build",
    label: "Platform Build",
    description: "Multi-role products with complex states and expanding modules.",
    basePrice: 3199,
  },
] as const;

const deliveryOptions = [
  { value: "standard", label: "Standard", detail: "3 to 5 weeks", modifier: 0 },
  { value: "priority", label: "Priority", detail: "2 to 3 weeks", modifier: 420 },
  { value: "rush", label: "Rush", detail: "7 to 10 days", modifier: 880 },
  { value: "phased", label: "Phased Launch", detail: "MVP first, later rollout", modifier: 260 },
] as const;

const featureOptions = [
  { id: "auth", label: "Authentication", price: 220 },
  { id: "payments", label: "Payments", price: 260 },
  { id: "dashboard", label: "Client Dashboard", price: 320 },
  { id: "cms", label: "CMS Editor", price: 240 },
  { id: "automation", label: "Automation", price: 380 },
  { id: "analytics", label: "Analytics Layer", price: 180 },
  { id: "booking", label: "Booking Flow", price: 210 },
  { id: "admin", label: "Admin Console", price: 290 },
] as const;

const stages = [
  { id: "name", label: "Name", title: "Give it a name", eyebrow: "01 / Project Identity" },
  { id: "track", label: "Track", title: "Select build track", eyebrow: "02 / Architecture" },
  { id: "delivery", label: "Delivery", title: "Set delivery mode", eyebrow: "03 / Velocity" },
  { id: "features", label: "Features", title: "Choose feature stack", eyebrow: "04 / Modules" },
  { id: "vision", label: "Vision", title: "Describe the core vision", eyebrow: "05 / Intent" },
  { id: "specs", label: "Specs", title: "Add detailed requirements", eyebrow: "06 / Requirements" },
  { id: "qa", label: "Q&A", title: "Final notes and questions", eyebrow: "07 / Handoff" },
] as const;

const stageTransition = {
  initial: { opacity: 0, x: 28, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -28, filter: "blur(4px)" },
};

function StageSquare({
  completed,
  active,
  index,
  onClick,
}: {
  completed: boolean;
  active: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-10 flex h-8 w-8 items-center justify-center border transition-all duration-400 ${
        completed || active
          ? "border-sky-300/80 bg-sky-300/18 text-sky-100 shadow-[0_0_18px_rgba(125,211,252,0.2)]"
          : "border-white/10 bg-black/30 text-white/30"
      }`}
      style={{ borderRadius: "2px" }}
      aria-label={`Go to stage ${index + 1}`}
    >
      {completed ? (
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          initial={false}
          animate="visible"
        >
          <motion.path
            d="M2.5 7.4 5.5 10.2 11.5 3.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              visible: { pathLength: 1, opacity: 1 },
            }}
            initial={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </motion.svg>
      ) : (
        <motion.div
          animate={{
            scale: active ? [1, 1.12, 1] : 1,
            opacity: active ? [0.7, 1, 0.7] : 0.45,
          }}
          transition={{ duration: 1.8, repeat: active ? Infinity : 0 }}
          className={`h-2.5 w-2.5 ${active ? "bg-sky-200" : "bg-white/30"}`}
        />
      )}
    </button>
  );
}

function FeatureDust({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-[2px] w-[2px] rounded-full bg-sky-200"
          style={{ left: `${14 + index * 7}%`, bottom: "18%" }}
          animate={{
            y: [0, -12 - index * 1.6, -24 - index * 2.6],
            x: [0, (index % 2 === 0 ? 1 : -1) * (4 + index * 0.8)],
            opacity: [0, 0.95, 0],
            scale: [0.8, 1.2, 0],
          }}
          transition={{
            duration: 1.45 + index * 0.04,
            repeat: Infinity,
            delay: index * 0.07,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function CustomOrderPage() {
  const { addToCart, toggleCart } = useCart();
  const [currentStage, setCurrentStage] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<(typeof buildTracks)[number]["name"] | null>(
    null
  );
  const [selectedDelivery, setSelectedDelivery] = useState<
    (typeof deliveryOptions)[number]["value"] | null
  >(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["auth", "dashboard"]);
  const [vision, setVision] = useState("");
  const [specs, setSpecs] = useState("");
  const [qaNotes, setQaNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const blobs = Array.from(document.querySelectorAll(".blob")) as HTMLElement[];
    const visibleCount = Math.min(3, currentStage);

    blobs.forEach((blob, index) => {
      if (index < 3) {
        blob.style.visibility = "visible";
        blob.style.opacity = index < visibleCount ? ["0.58", "0.5", "0.44"][index] : "0";
      } else {
        blob.style.opacity = "0";
      }
    });

    return () => {
      blobs.forEach((blob) => {
        blob.style.opacity = "";
        blob.style.visibility = "";
      });
    };
  }, [currentStage]);

  const activeTrack = useMemo(
    () => buildTracks.find((track) => track.name === selectedTrack) ?? buildTracks[1],
    [selectedTrack]
  );

  const activeDelivery = useMemo(
    () => deliveryOptions.find((option) => option.value === selectedDelivery) ?? deliveryOptions[0],
    [selectedDelivery]
  );

  const estimate = useMemo(() => {
    const trackPrice = selectedTrack ? activeTrack.basePrice : 0;
    const deliveryPrice = selectedDelivery ? activeDelivery.modifier : 0;
    const featuresTotal = selectedFeatures.reduce((total, featureId) => {
      const feature = featureOptions.find((option) => option.id === featureId);
      return total + (feature?.price ?? 0);
    }, 0);

    return trackPrice + deliveryPrice + featuresTotal;
  }, [activeDelivery.modifier, activeTrack.basePrice, selectedDelivery, selectedFeatures, selectedTrack]);

  const orderSummary = useMemo(() => {
    const title = projectName.trim() || `${activeTrack.label} Custom Order`;
    return `Custom Order: ${title}`;
  }, [activeTrack.label, projectName]);

  const stageCompletion = useMemo(
    () => [
      projectName.trim().length >= 3,
      !!selectedTrack,
      !!selectedDelivery,
      selectedFeatures.length > 0,
      vision.trim().length >= 40,
      specs.trim().length >= 40,
      qaNotes.trim().length >= 16,
    ],
    [projectName, qaNotes, selectedDelivery, selectedFeatures.length, selectedTrack, specs, vision]
  );

  const progressPercent = ((currentStage + 1) / stages.length) * 100;
  const isCurrentStageValid = stageCompletion[currentStage];
  const isReady = stageCompletion.every(Boolean);

  const nextStage = () => {
    if (currentStage < stages.length - 1 && isCurrentStageValid) {
      setCurrentStage((value) => value + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage((value) => value - 1);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((current) =>
      current.includes(featureId)
        ? current.filter((item) => item !== featureId)
        : [...current, featureId]
    );
  };

  const handleAddToCart = () => {
    if (!isReady) return;

    addToCart({
      name: orderSummary,
      price: estimate.toFixed(2),
    });
    setJustAdded(true);
    toggleCart();
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <main
      className="min-h-screen text-slate-200 antialiased selection:bg-sky-300/30 selection:text-white"
      style={{}}
    >
      <SiteHeader />
      <section className="px-6 pb-16 pt-32">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative mx-auto flex min-h-[43rem] w-full max-w-[72rem] flex-col overflow-hidden border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:p-10"
            style={{ borderRadius: "1px" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.08),transparent_30%)]" />

            <div className="relative z-10 border-b border-white/10 pb-8">
              <div className="mb-8 flex items-end justify-between gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">
                    Custom Build Intake
                  </p>
                  <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.16em] text-white md:text-[3.35rem]">
                    Build It In Stages
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    Scope the order step by step, then create the final custom order shell for cart.
                  </p>
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-[10px] uppercase tracking-[0.42em] text-white/35">
                    Starting Estimate
                  </p>
                  <p className="mt-2 font-display text-5xl tracking-tight text-white">
                    $<AnimatedCurrency value={estimate} />
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 right-0 top-4 h-[1px] bg-white/10" />
                <motion.div
                  className="absolute left-0 top-4 h-[1px] bg-sky-300"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />

                <div className="relative grid grid-cols-7 gap-2">
                  {stages.map((stage, index) => {
                    const completed = index < currentStage;
                    const active = index === currentStage;

                    return (
                      <div key={stage.id} className="flex flex-col items-center">
                        <StageSquare
                          completed={completed}
                          active={active}
                          index={index}
                          onClick={() => {
                            if (index <= currentStage || stageCompletion[index - 1]) {
                              setCurrentStage(index);
                            }
                          }}
                        />

                        <div className="mt-4 min-h-[1.15rem] text-center">
                          {active ? (
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] uppercase tracking-[0.32em] text-sky-200"
                            >
                              {stage.label}
                            </motion.p>
                          ) : (
                            <p className="text-[10px] uppercase tracking-[0.32em] text-white/20">
                              {completed ? stage.label : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-1 flex-col justify-between">
              <div className="grid flex-1 gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="min-h-[21.5rem] border border-white/10 bg-black/20 p-7 backdrop-blur-xl" style={{ borderRadius: "1px" }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {currentStage === 0 && (
                      <motion.div
                        key="name"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[0].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[0].title}
                        </h2>
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/50">Project Name</label>
                          <input
                            value={projectName}
                            onChange={(event) => setProjectName(event.target.value)}
                            placeholder="Example: Nexus Client Hub"
                            className="w-full border border-white/10 bg-white/[0.04] px-5 py-5 text-xl text-white outline-none transition focus:border-sky-300/70 focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                          />
                          <div className="flex justify-between text-[10px] uppercase tracking-[0.26em] text-white/28">
                            <span>3+ chars to continue</span>
                            <span>{projectName.length} chars</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 1 && (
                      <motion.div
                        key="track"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[1].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[1].title}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {buildTracks.map((track) => {
                            const selected = track.name === selectedTrack;
                            return (
                              <button
                                key={track.name}
                                type="button"
                                onClick={() => setSelectedTrack(track.name)}
                                className={`border p-5 text-left transition-all duration-300 ${
                                  selected
                                    ? "border-sky-300/70 bg-sky-300/10 shadow-[0_0_28px_rgba(125,211,252,0.12)]"
                                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                                }`}
                                style={{ borderRadius: "1px" }}
                              >
                                <p className="font-display text-lg uppercase tracking-[0.16em] text-white">
                                  {track.label}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-400">{track.description}</p>
                                <p className="mt-5 text-xs uppercase tracking-[0.28em] text-sky-200/80">
                                  From ${track.basePrice}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 2 && (
                      <motion.div
                        key="delivery"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[2].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[2].title}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {deliveryOptions.map((option) => {
                            const selected = option.value === selectedDelivery;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelectedDelivery(option.value)}
                                className={`border p-5 text-left transition-all duration-300 ${
                                  selected
                                    ? "border-sky-300/70 bg-sky-300/10 shadow-[0_0_28px_rgba(125,211,252,0.12)]"
                                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                                }`}
                                style={{ borderRadius: "1px" }}
                              >
                                <p className="font-display text-lg uppercase tracking-[0.16em] text-white">
                                  {option.label}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-400">{option.detail}</p>
                                <p className="mt-5 text-xs uppercase tracking-[0.28em] text-sky-200/80">
                                  {option.modifier === 0 ? "No extra fee" : `+$${option.modifier}`}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 3 && (
                      <motion.div
                        key="features"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[3].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[3].title}
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {featureOptions.map((feature) => {
                            const selected = selectedFeatures.includes(feature.id);

                            return (
                              <button
                                key={feature.id}
                                type="button"
                                onClick={() => toggleFeature(feature.id)}
                                className={`relative overflow-hidden border px-5 py-4 text-left transition-all duration-300 ${
                                  selected
                                    ? "border-sky-300/70 bg-sky-300/10 shadow-[0_0_28px_rgba(125,211,252,0.12)]"
                                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                                }`}
                                style={{ borderRadius: "1px" }}
                              >
                                <FeatureDust active={selected} />
                                <div className="relative z-10 flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-sm uppercase tracking-[0.16em] text-white">
                                      {feature.label}
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.26em] text-slate-500">
                                      +${feature.price}
                                    </p>
                                  </div>
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center border ${
                                      selected
                                        ? "border-sky-300/80 bg-sky-300/18 text-sky-100"
                                        : "border-white/15 text-white/30"
                                    }`}
                                    style={{ borderRadius: "2px" }}
                                  >
                                    <AnimatePresence mode="wait" initial={false}>
                                      {selected ? (
                                        <motion.svg
                                          key="checked"
                                          width="15"
                                          height="15"
                                          viewBox="0 0 15 15"
                                          fill="none"
                                        >
                                          <motion.path
                                            d="M3 7.7 6.1 10.5 12 4.6"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ pathLength: 0, opacity: 0 }}
                                            transition={{ duration: 0.28, ease: "easeOut" }}
                                          />
                                        </motion.svg>
                                      ) : (
                                        <motion.span
                                          key="plus"
                                          initial={{ opacity: 0, scale: 0.7 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.7 }}
                                          className="text-sm"
                                        >
                                          +
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 4 && (
                      <motion.div
                        key="vision"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[4].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[4].title}
                        </h2>
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/50">Core Vision</label>
                          <textarea
                            value={vision}
                            onChange={(event) => setVision(event.target.value)}
                            placeholder="Describe the business goal, user flow, and the first thing this build must solve."
                            className="min-h-[15rem] w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-white outline-none transition focus:border-sky-300/70 focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                          />
                          <div className="flex justify-between text-[10px] uppercase tracking-[0.26em] text-white/28">
                            <span>40+ chars to continue</span>
                            <span>{vision.length} chars</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 5 && (
                      <motion.div
                        key="specs"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[5].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[5].title}
                        </h2>
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/50">Detailed Requirements</label>
                          <textarea
                            value={specs}
                            onChange={(event) => setSpecs(event.target.value)}
                            placeholder="List integrations, technical constraints, preferred admin controls, content structure, or any hard requirements."
                            className="min-h-[15rem] w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-white outline-none transition focus:border-sky-300/70 focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                          />
                          <div className="flex justify-between text-[10px] uppercase tracking-[0.26em] text-white/28">
                            <span>40+ chars to continue</span>
                            <span>{specs.length} chars</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStage === 6 && (
                      <motion.div
                        key="qa"
                        variants={stageTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">{stages[6].eyebrow}</p>
                        <h2 className="font-display text-4xl uppercase tracking-[0.14em] text-white">
                          {stages[6].title}
                        </h2>
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/50">Questions / Notes</label>
                          <textarea
                            value={qaNotes}
                            onChange={(event) => setQaNotes(event.target.value)}
                            placeholder="Anything else we should know before this becomes the final custom order shell?"
                            className="min-h-[15rem] w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-white outline-none transition focus:border-sky-300/70 focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                          />
                          <div className="flex justify-between text-[10px] uppercase tracking-[0.26em] text-white/28">
                            <span>16+ chars to finish</span>
                            <span>{qaNotes.length} chars</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border border-white/10 bg-black/20 p-7 backdrop-blur-xl" style={{ borderRadius: "1px" }}>
                  <p className="text-xs uppercase tracking-[0.42em] text-sky-200/80">Order Snapshot</p>
                  <h3 className="mt-4 font-display text-3xl uppercase tracking-[0.14em] text-white">
                    {orderSummary}
                  </h3>

                  <div className="mt-8 space-y-5 border-y border-white/10 py-6 text-sm text-slate-300">
                    <div className="flex justify-between gap-4">
                      <span className="uppercase tracking-[0.24em] text-white/45">Track</span>
                      <span className="text-right">{selectedTrack ? activeTrack.label : "Pending"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="uppercase tracking-[0.24em] text-white/45">Delivery</span>
                      <span className="text-right">{selectedDelivery ? activeDelivery.label : "Pending"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="uppercase tracking-[0.24em] text-white/45">Features</span>
                      <span className="max-w-[16rem] text-right">
                        {selectedFeatures.length > 0
                          ? selectedFeatures
                              .map(
                                (featureId) =>
                                  featureOptions.find((feature) => feature.id === featureId)?.label
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "No modules selected"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.36em] text-white/40">
                      Starting Estimate
                    </p>
                    <p className="mt-3 font-display text-5xl tracking-tight text-white">
                      $<AnimatedCurrency value={estimate} />
                    </p>
                    <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      The price updates as each stage adds direction, scope, and delivery pressure.
                    </p>
                  </div>

                  <div className="mt-8 border border-white/10 bg-white/[0.03] p-5" style={{ borderRadius: "1px" }}>
                    <p className="text-xs uppercase tracking-[0.32em] text-white/50">Stage Status</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {isReady
                        ? "All intake stages are complete. This custom build can now be created as a cart item."
                        : `Stage ${currentStage + 1} of ${stages.length}. Complete this section to move forward.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStage}
                    disabled={currentStage === 0}
                    className="border border-white/10 bg-white/[0.03] px-7 py-4 text-xs uppercase tracking-[0.34em] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-20"
                    style={{ borderRadius: "1px" }}
                  >
                    Back
                  </button>

                  {currentStage < stages.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStage}
                      disabled={!isCurrentStageValid}
                      className="border border-sky-300/50 bg-sky-300/12 px-7 py-4 text-xs uppercase tracking-[0.34em] text-sky-100 transition hover:bg-sky-300/18 disabled:cursor-not-allowed disabled:opacity-20"
                      style={{ borderRadius: "1px" }}
                    >
                      Next Stage
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!isReady}
                      className="border border-sky-300/50 bg-sky-300 px-7 py-4 text-xs uppercase tracking-[0.34em] text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-20"
                      style={{ borderRadius: "1px" }}
                    >
                      {justAdded ? "Added To Cart" : "Create Custom Order"}
                    </button>
                  )}
                </div>

                <p className="text-[10px] uppercase tracking-[0.32em] text-white/24">
                  Fixed-stage intake. Smooth transitions. Cart-ready only at the end.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
