"use client";

import { useEffect, useRef } from "react";

export default function NotFound() {
  const textRef1 = useRef<HTMLSpanElement>(null);
  const textRef2 = useRef<HTMLSpanElement>(null);
  const text1 = "404";
  const text2 = "This page could not be found.";

  const animateText = (element: HTMLElement, text: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let iteration = 0;

    if (!element) return;

    const interval = setInterval(() => {
      element.innerText = text
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }
          if (index < iteration + 2) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return " ";
        })
        .join("");

      if (iteration >= text.length) {
        clearInterval(interval);
        element.innerText = text; // Ensure final text is correct
      }

      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (textRef1.current) {
      animateText(textRef1.current, text1);
    }
    const timeoutId = setTimeout(() => {
      if (textRef2.current) {
        animateText(textRef2.current, text2);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div
        className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg p-12"
        style={{ borderRadius: "1px" }}
      >
        <div className="flex items-center gap-8 font-display text-4xl uppercase tracking-widest text-slate-300">
          <span ref={textRef1} />
          <span className="dynamic-line h-10" />
          <span ref={textRef2} />
        </div>
      </div>
    </main>
  );
}
