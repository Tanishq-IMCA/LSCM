"use client";

import { useEffect, useRef } from "react";
import XrayTitle from "./XrayTitle";
import { useLoading } from "@/context/LoadingContext";

export function Hero() {
  const { isLoading } = useLoading();
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const subtext =
    "A restrained dark interface for software delivery, game concepts, and the internal operating surface behind them.";

  const animateText = (element: HTMLElement, text: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let iteration = 0;

    const interval = setInterval(() => {
      if (!element) {
        clearInterval(interval);
        return;
      }
      element.innerText = text
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }
          if (index < iteration + 2) {
            // Smoother glitch effect
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return " ";
        })
        .join("");

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1;
    }, 25); // Smoother animation speed
  };

  useEffect(() => {
    if (!isLoading && subtextRef.current) {
      animateText(subtextRef.current, subtext);
    }
  }, [isLoading]);

  return (
    <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 px-6 py-16">
      <div className="space-y-8">
        <div className="inline-flex rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase text-muted">
          Decoupled hybrid agency platform
        </div>
        <div className="space-y-5">
          <XrayTitle text="CODEGNITION" className="font-display text-7xl h-[80px] sm:h-[150px]" />
          <p
            ref={subtextRef}
            className="max-w-2xl font-body text-base leading-7 text-slate-300 sm:text-lg"
            style={{ minHeight: "3.5rem" }} // Reserve space to prevent layout shift
          >
            {/* Initially empty, populated by animation */}
          </p>
        </div>
      </div>
    </section>
  );
}