"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentBar } from "@/components/ui/SegmentBar";

const SCENARIOS = [
  {
    repo: "DIAMOND HEIST // FINISHED",
    language: "PAYOUT 3.59M",
    loc: "NEXT SLOT 20:00",
    files: 3,
    deps: 2,
    scores: [
        { label: "PAYOUT", value: 92 },
        { label: "PREP", value: 84 },
        { label: "SLOTS", value: 76 },
        { label: "VIP", value: 91 },
        { label: "CREW", value: 88 },
    ],
    metrics: [
        { label: "Payout", value: "3.59M", color: "var(--accent)" },
        { label: "Heists", value: "2", color: "#facc15" },
        { label: "Slots", value: "3", color: "rgba(255,255,255,0.4)" },
    ],
    issues: 3,
    severity: "medium",
  },
  {
    repo: "PANTHER CAYO // READY",
    language: "PAYOUT 2.0M",
    loc: "NEXT SLOT 20:20",
    files: 3,
    deps: 1,
    scores: [
      { label: "OVERALL", value: 91 },
      { label: "SECURITY", value: 88 },
      { label: "COMPLEXITY", value: 76 },
      { label: "COVERAGE", value: 82 },
      { label: "MAINTAIN", value: 85 },
    ],
    metrics: [
        { label: "Payout", value: "2.0M", color: "var(--accent)" },
        { label: "Heists", value: "1", color: "#facc15" },
        { label: "Slots", value: "3", color: "rgba(255,255,255,0.4)" },
    ],
    issues: 1,
    severity: "low",
  },
  {
    repo: "MODDED CAR DAY // THU",
    language: "GARAGE REQUESTS",
    loc: "09:00 — 15:00 CST",
    files: 6,
    deps: 4,
    scores: [
      { label: "OVERALL", value: 78 },
      { label: "SECURITY", value: 95 },
      { label: "COMPLEXITY", value: 64 },
      { label: "COVERAGE", value: 71 },
      { label: "MAINTAIN", value: 74 },
    ],
    metrics: [
      { label: "Overall", value: "78", color: "var(--accent)" },
      { label: "Issues", value: "5", color: "#facc15" },
      { label: "LOC", value: "22.1k", color: "rgba(255,255,255,0.4)" },
    ],
    issues: 5,
    severity: "medium",
  },
  {
    repo: "VIP CREW // CLOVER ACTIVE",
    language: "PRIORITY ACCESS",
    loc: "MON — FRI",
    files: 3,
    deps: 5,
    scores: [
      { label: "OVERALL", value: 69 },
      { label: "SECURITY", value: 61 },
      { label: "COMPLEXITY", value: 88 },
      { label: "COVERAGE", value: 55 },
      { label: "MAINTAIN", value: 67 },
    ],
    metrics: [
      { label: "Overall", value: "69", color: "var(--accent)" },
      { label: "Issues", value: "12", color: "#facc15" },
      { label: "LOC", value: "31.5k", color: "rgba(255,255,255,0.4)" },
    ],
    issues: 12,
    severity: "high",
  },
];

const CYCLE_DURATION = 9500; // ms per scenario

export function MacWindow() {
  const [cycle, setCycle] = useState(0);
  const [activeTab, setActiveTab] = useState<"SERVICE BOARD" | "LOADOUT">("SERVICE BOARD");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  const scenario = SCENARIOS[cycle % SCENARIOS.length];
  const [fetchSeconds, setFetchSeconds] = useState("3.2");
  useEffect(() => {
    setFetchSeconds((2 + Math.random() * 2).toFixed(1));
  }, [cycle]);

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    const clearTimers = () => {
      if (scanTimeoutRef.current) { clearTimeout(scanTimeoutRef.current); scanTimeoutRef.current = null; }
      if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
      if (resultsTimeoutRef.current) { clearTimeout(resultsTimeoutRef.current); resultsTimeoutRef.current = null; }
      if (cycleTimeoutRef.current) { clearTimeout(cycleTimeoutRef.current); cycleTimeoutRef.current = null; }
      if (exitTimeoutRef.current) { clearTimeout(exitTimeoutRef.current); exitTimeoutRef.current = null; }
    };

    setActiveTab("SERVICE BOARD");
    setScanning(false);
    setScanProgress(0);
    setScanDone(false);
    setExiting(false);

    scanTimeoutRef.current = setTimeout(() => {
      if (!mounted) return;
      setScanning(true);
      let p = 0;
      scanIntervalRef.current = setInterval(() => {
        p += 8;
        setScanProgress(Math.min(p, 100));
        if (p >= 100) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          setScanning(false);
          setScanDone(true);
          resultsTimeoutRef.current = setTimeout(() => setActiveTab("LOADOUT"), 500);
        }
      }, 85);
    }, 1500);

    cycleTimeoutRef.current = setTimeout(() => {
      if (!mounted) return;
      setExiting(true);
      exitTimeoutRef.current = setTimeout(() => {
        if (!mounted) return;
        setCycle(c => c + 1);
      }, 700);
    }, CYCLE_DURATION);

    return () => {
      mounted = false;
      clearTimers();
    };
  }, [cycle]);

  const TABS = ["SERVICE BOARD", "LOADOUT"] as const;

  const issueColor = scenario.severity === "high" ? "#ef4444" : scenario.severity === "medium" ? "#facc15" : "var(--accent)";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cycle}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={exiting ? { opacity: 0, y: -24, scale: 0.97 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div
          className="relative overflow-hidden backdrop-blur-xl"
          style={{
            borderRadius: 0,
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.10)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
            WebkitBackdropFilter: "blur(24px)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)",
            }}
          />

          <div
            className="relative flex items-center gap-0 px-4 border-b"
            style={{
              height: 38,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <div className="flex items-center gap-2 mr-5">
              {[
                { color: "#ff5f56" },
                { color: "#ffbd2e" },
                { color: "#27c93f" },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full cursor-default"
                  style={{
                    backgroundColor: btn.color,
                    boxShadow: `0 0 5px ${btn.color}60`,
                  }}
                />
              ))}
            </div>

            <div className="flex h-full items-end">
              {TABS.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 h-7 flex items-center text-[10px] tracking-[0.26em] uppercase transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
                      background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                      borderBottom: isActive ? "1px solid rgba(7,9,20,0.97)" : "none",
                      marginBottom: isActive ? -1 : 0,
                      borderRadius: 0,
                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${scanDone ? "" : "animate-pulse"}`}
                style={{ backgroundColor: scanDone ? "var(--accent)" : "#facc15" }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.2)" }}
              >
                {scenario.repo}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "SERVICE BOARD" ? (
              <motion.div
                key="audit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-5 space-y-4"
              >
                <div className="space-y-1.5">
                    {[
                     { t: `> checking availability: ${scenario.repo}`, c: "rgba(255,255,255,0.25)" },
                     { t: `✓ ${scenario.files.toLocaleString()} live slots available`, c: "var(--accent)" },
                     { t: `✓ ${scenario.deps} management channels ready`, c: "var(--accent)" },
                    { t: "✓ management support online", c: "var(--accent)" },
                    { t: `! ${scenario.issues} featured drops available`, c: issueColor },
                     { t: "> preparing your service...", c: "rgba(255,255,255,0.25)" },
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.12, duration: 0.2 }}
                      className="text-[11px] leading-relaxed"
                      style={{ fontFamily: "var(--font-mono)", color: line.c }}
                    >
                      {line.t}
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {scanning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: "var(--font-mono)" }}>
                            Confirming
                        </span>
                        <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
                          {Math.round(scanProgress)}%
                        </span>
                      </div>
                      <div className="h-[2px] w-full bg-white/[0.05] overflow-hidden">
                        <motion.div
                          className="h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
                          style={{
                            background: "linear-gradient(90deg, rgba(16,185,129,0.5) 0%, #10b981 100%)",
                            boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-5"
              >
                <div className="text-[10px] tracking-[0.32em] uppercase text-white/20 mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                    Service Breakdown
                </div>
                <div className="space-y-3">
                  {scenario.scores.map((s, i) => (
                    <SegmentBar
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      segments={28}
                      segmentHeight={2}
                      delay={i * 0.1}
                      labelWidth={74}
                    />
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/[0.05] grid grid-cols-3 gap-3">
                  {scenario.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="text-lg" style={{ fontFamily: "var(--font-display)", color: m.color }}>
                        {m.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center justify-between px-5 py-2 border-t"
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <span className="text-[10px] text-white/15 tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              {scenario.loc} · {scenario.language}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)", color: scanDone ? "var(--accent)" : "rgba(255,255,255,0.15)" }}>
               {scanDone ? "✓ Ready" : "● Live"}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
