"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { showNotice } from "@/components/ui/NexusNotice";
import { Header } from "@/components/Landing/Header";
import { Footer } from "@/components/Landing/Footer";
import GlitchyText from "@/components/ui/GlitchyText";
import { TypewriterHeadline } from "@/components/ui/TypewriterHeadline";
import { SegmentBar } from "@/components/ui/SegmentBar";
import TechCarousel from "@/components/Landing/TechCarousel";
import { MacWindow } from "@/components/Landing/MacWindow";

// ─── DATA ───────────────────────────────────────────────────────────────────

const CLI_LINES = [
  { text: "HEIST FINISHED", delay: 0, accent: true },
  { text: "PAYOUT 3.59M // DIAMONDS SECURED", delay: 350 },
  { text: "NEXT SLOT // 20:00", delay: 700 },
  { text: "MANAGEMENT ONLINE ✓", delay: 1050, accent: true },
];

const SAMPLE_SCORES = [
  { label: "OVERALL", value: 84 },
  { label: "SECURITY", value: 73 },
  { label: "COMPLEXITY", value: 91 },
  { label: "COVERAGE", value: 68 },
  { label: "MAINTAIN", value: 79 },
];

const STATS = [
  { value: "3.59M", label: "Featured Payout" },
  { value: "30 MIN", label: "Heist Cooldown" },
  { value: "3", label: "Live Slots" },
  { value: "24/7", label: "Community Support" },
];

const FEATURES = [
  {
    tag: "01 — ACCOUNT BOOSTS",
    heading: "STACK YOUR ACCOUNT",
    body: "Starter, Premium and Deluxe account services with unlocks, stats, outfits, businesses and custom setups coordinated by management.",
    visual: "code",
  },
  {
    tag: "02 — MODDED BUILDS",
    heading: "MAKE THE GARAGE YOURS",
    body: "Request custom modded vehicles, garages, outfits and loadouts built around how you play Los Santos.",
    visual: "audit",
  },
  {
    tag: "03 — PREMIUM HEISTS",
    heading: "RUN THE BIG SCORE",
    body: "Diamond Casino, Panther Cayo and other premium heist support with live availability, prep coordination and payout guidance.",
    visual: "security",
  },
  {
    tag: "04 — VIP ACCESS",
    heading: "GET PRIORITY TREATMENT",
    body: "Join the crew, earn your green clover and unlock a VIP-first community experience while your trial is active.",
    visual: "report",
  },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CliLine({
  text,
  delay,
  accent,
}: {
  text: string;
  delay: number;
  accent?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="text-[11px] leading-relaxed"
      style={{
        fontFamily: "var(--font-mono)",
        color: accent ? "var(--accent)" : "rgba(255,255,255,0.28)",
      }}
    >
      {text}
    </motion.div>
  );
}

function FeatureVisual({ type }: { type: string }) {
  if (type === "code")
    return (
      <div className="absolute top-0 right-0 w-40 h-36 opacity-25 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 p-3 text-[7px] leading-4"
          style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
        >
      <div>{"const crew = new"}</div>
      <div>{"  LSCMService();"}</div>
      <div className="opacity-50">{"await crew.prepare({"}</div>
      <div className="opacity-50">{"  custom: true"}</div>
      <div className="opacity-50">{"});"}</div>
        </div>
      </div>
    );
  if (type === "audit")
    return (
      <div className="absolute top-4 right-4 w-28 h-28 opacity-20 pointer-events-none">
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-white/30"
          />
          <circle
            cx="40"
            cy="40"
            r="22"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/40"
          />
          <circle
            cx="40"
            cy="40"
            r="8"
            fill="currentColor"
            className="text-white/30"
          />
          <line
            x1="40"
            y1="6"
            x2="40"
            y2="18"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/50"
          />
        </svg>
      </div>
    );
  if (type === "security")
    return (
      <div className="absolute top-3 right-3 w-32 h-28 opacity-20 pointer-events-none">
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          <path
            d="M40 8L12 20v20c0 16 12 28 28 32C56 68 68 56 68 40V20L40 8z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/50"
          />
          <path
            d="M28 40l8 8 16-16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/60"
          />
        </svg>
      </div>
    );
  if (type === "report")
    return (
      <div className="absolute top-3 right-3 w-28 h-32 opacity-20 pointer-events-none">
        <div
          className="w-full h-full border border-white/20"
          style={{ borderRadius: 2 }}
        >
          {[82, 65, 90, 55, 72].map((w, i) => (
            <div
              key={i}
              className="mx-3 mt-3 h-1 bg-white/20"
              style={{ width: `${w}%`, borderRadius: 1 }}
            />
          ))}
        </div>
      </div>
    );
  return null;
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative overflow-hidden border border-white/[0.08] p-8 transition-all duration-700 hover:border-white/[0.16] hover:bg-white/[0.03]"
      style={{
        borderRadius: "2px",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <FeatureVisual type={feature.visual} />
      <img
        src="/logo-dark-semi-colourised.png"
        alt=""
        className="pointer-events-none absolute bottom-5 right-5 h-10 w-auto opacity-20 grayscale transition duration-500 group-hover:opacity-40 group-hover:grayscale-0"
      />
      {/* Hover accent bottom line */}
      <div
        className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-700"
        style={{
          background:
            "linear-gradient(90deg, var(--accent) 0%, transparent 100%)",
        }}
      />
      <div className="relative">
        <div
          className="text-[10px] tracking-[0.38em] mb-5 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
        >
          {feature.tag}
        </div>
        <GlitchyText
          text={feature.heading}
          as="h3"
          className="text-sm tracking-[0.14em] text-white mb-4 uppercase block"
          style={{ fontFamily: "var(--font-display)" } as React.CSSProperties}
        />
        <p
          className="text-sm text-white/30 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {feature.body}
        </p>
      </div>
    </motion.div>
  );
}

function StatNumber({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div
        className="text-4xl md:text-5xl text-white mb-1.5 tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.32em] text-white/22"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ─── BUTTON PRIMITIVES ────────────────────────────────────────────────────────

/** Accent (filled emerald) button — shimmer sweeps on each hover-in */
function AccentButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [shimKey, setShimKey] = useState(0);
  const [glow, setGlow] = useState(false);

  return (
    <motion.button
      onHoverStart={() => {
        setShimKey((k) => k + 1);
        setGlow(true);
      }}
      onHoverEnd={() => setGlow(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-center gap-2.5 text-black ${className}`}
      style={{
        backgroundColor: "var(--accent)",
        borderRadius: 0,
        fontFamily: "var(--font-display)",
        boxShadow: glow
          ? "0 0 40px rgba(16,185,129,0.45), 0 0 80px rgba(16,185,129,0.15)"
          : "0 0 24px rgba(16,185,129,0.22)",
        transition: "box-shadow 0.25s",
      }}
    >
      {/* Shimmer — new key each hover-in triggers fresh animation */}
      <motion.span
        key={shimKey}
        className="pointer-events-none absolute inset-0"
        initial={{ x: "-110%", skewX: "-10deg" }}
        animate={{ x: "250%" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
        }}
      />
      {children}
    </motion.button>
  );
}

/** Ghost (outline) button — fills from left + border/text brighten on hover */
function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: 0,
        fontFamily: "var(--font-display)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}`,
        color: hovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
        transition: "color 0.25s, border-color 0.25s",
      }}
    >
      {/* Fill overlay slides in from left */}
      <motion.span
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          transformOrigin: "left",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleBeginAudit = () => {
    router.push('/store');
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      showNotice('ALREADY SIGNED IN', 'Redirecting to your dashboard...', 'system');
      setTimeout(() => router.push('/dashboard'), 600);
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-display)" }}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-20 items-center">
            {/* Left */}
            <div>
              {/* CLI animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-10 space-y-1"
              >
                {CLI_LINES.map((line, i) => (
                  <CliLine key={i} {...line} />
                ))}
              </motion.div>

              {/* Headline */}
              <div className="mb-7">
                <TypewriterHeadline
                  phrases={[
                    "WE ARE LSCM.",
                    "HEIST FINISHED.",
                    "PAYOUT 3.59M.",
                    "RUN THE CITY.",
                  ]}
                  className="block leading-[1.04] tracking-[0.04em] uppercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(52px, 8vw, 100px)",
                    color: "white",
                  }}
                />
              </div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 2.8 }}
                className="mb-3"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.38em] mb-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                  }}
                >
                   GTA V MODDING COMMUNITY
                </p>
                <p
                  className="text-sm text-white/32 leading-[1.8] max-w-md"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                   Account boosts, custom modded builds, premium heists and VIP
                   access — coordinated through the LSCM community.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.1 }}
                className="flex items-center gap-4 mt-10"
              >
                <AccentButton
                  onClick={handleBeginAudit}
                  className="px-8 py-4 text-[11px] uppercase tracking-[0.34em]"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                   Explore Services
                </AccentButton>

                <GhostButton
                  onClick={handleSignIn}
                  className="px-8 py-4 text-[11px] uppercase tracking-[0.34em]"
                >
                  Sign In
                </GhostButton>
              </motion.div>
            </div>

            {/* Right — macOS Terminal */}
            <div className="hidden lg:block">
              <MacWindow />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className="text-[10px] uppercase tracking-[0.44em] text-white/15"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-7 bg-gradient-to-b from-white/15 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── TECH CAROUSEL ─────────────────────────────────────────────────── */}
      <TechCarousel />

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((stat, i) => (
              <StatNumber
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p
                className="text-[10px] tracking-[0.44em] uppercase mb-4"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                }}
              >
                Capabilities
              </p>
              <GlitchyText
                 text="WHAT WE OFFER"
                as="h2"
                className="text-4xl md:text-6xl text-white tracking-[0.07em] uppercase"
                style={
                  { fontFamily: "var(--font-display)" } as React.CSSProperties
                }
              />
              <p
                className="text-sm text-white/28 leading-relaxed max-w-lg mt-4"
                style={{ fontFamily: "var(--font-body)" }}
              >
                 Practical GTA V services, custom requests and community support built
                 for players who want more from every session.
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.tag} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p
                className="text-[10px] tracking-[0.44em] uppercase mb-4"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                }}
              >
                Process
              </p>
              <GlitchyText
                 text="THREE STEPS. GET LOADED."
                as="h2"
                className="text-4xl md:text-6xl text-white tracking-[0.07em] uppercase"
                style={
                  { fontFamily: "var(--font-display)" } as React.CSSProperties
                }
              />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                step: "01",
                  cmd: "DISCORD // START HERE",
                 title: "JOIN THE CREW",
                  desc: "Join the Discord to meet the crew, see live availability and receive support from management.",
                  href: "https://discord.gg/wy5ws9vVMs",
              },
              {
                step: "02",
                  cmd: "SERVICE // CHOOSE YOUR LOADOUT",
                 title: "CHOOSE YOUR SERVICE",
                 desc: "Pick an account boost, custom car build, heist preparation, add-on or VIP tier.",
                  href: "/store",
              },
              {
                step: "03",
                   cmd: "CREW // SEE WHO'S RUNNING LOS SANTOS",
                  title: "CHECK OUT OUR CREW",
                  desc: "See the LSCM crew on Rockstar Social Club, follow our heists and connect with the players running the city.",
                   href: "https://socialclub.rockstargames.com/crew/lscm_and_safe_heists/",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative overflow-hidden border border-white/[0.08] p-8 transition-all duration-700 hover:border-white/[0.16]"
                style={{
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-700"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--accent) 0%, transparent 100%)",
                  }}
                />
                <div
                  className="text-[10px] tracking-[0.4em] mb-4 uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                  }}
                >
                  {item.step}
                </div>
                <div
                  className="text-xs mb-5 px-3 py-2 bg-white/[0.03] border border-white/[0.05]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                    borderRadius: "2px",
                  }}
                >
                   {item.cmd}
                </div>
                <GlitchyText
                  text={item.title}
                  as="h3"
                  className="text-base tracking-[0.18em] text-white mb-3 uppercase block"
                  style={
                    { fontFamily: "var(--font-display)" } as React.CSSProperties
                  }
                />
                <p
                  className="text-sm text-white/30 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.desc}
                </p>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="mt-6 inline-flex border border-white/[0.12] px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] text-white/60 transition hover:border-[var(--accent)] hover:text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {i === 0 ? "Join Discord" : i === 1 ? "Choose Service" : "View Our Crew"}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[10px] tracking-[0.44em] uppercase mb-8"
              style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
            >
               Enter the community
            </p>
            <h2
              className="text-5xl md:text-7xl tracking-[0.05em] uppercase mb-10"
              style={{ fontFamily: "var(--font-display)" }}
            >
               <GlitchyText
                 text="READY TO RUN"
                as="span"
                triggerOnMount
                className="text-white"
              />{" "}
              <GlitchyText
                 text="THE CITY?"
                as="span"
                triggerOnMount
                style={{ color: "var(--accent)" } as React.CSSProperties}
              />
            </h2>
            <div className="mt-8 flex flex-col items-center">
              <p
                className="text-sm text-white/28 mb-10 max-w-sm mx-auto text-center leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                 Browse the catalogue, join the Discord and let management
                 coordinate your service.
              </p>
              <AccentButton
                onClick={() => router.push("/store")}
                className="mx-auto px-12 py-5 text-[11px] uppercase tracking-[0.34em]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                 Visit the Store
              </AccentButton>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
